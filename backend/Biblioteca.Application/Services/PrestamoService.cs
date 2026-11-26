using Biblioteca.Application.Domain;
using Biblioteca.Application.Domain.EstadosEjemplar;
using Biblioteca.Application.DTOs.Circulacion;
using Biblioteca.Application.Exceptions;
using Biblioteca.Infrastructure.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Application.Services;

public class PrestamoService
{
    private readonly BibliotecaDbContext _db;

    public PrestamoService(BibliotecaDbContext db) => _db = db;

    public async Task<IReadOnlyList<PrestamoDetalleDto>> ListarAsync(bool? soloActivos, int? idLector, CancellationToken ct = default)
    {
        var ahora = RelojPeru.Ahora();
        var query = _db.Prestamos.AsNoTracking()
            .Include(p => p.Lector)
            .Include(p => p.Ejemplar).ThenInclude(e => e.Edicion).ThenInclude(ed => ed.Libro)
            .AsQueryable();

        if (soloActivos == true)
            query = query.Where(p => p.FechaDevolucionReal == null);
        if (idLector.HasValue)
            query = query.Where(p => p.IdLector == idLector.Value);

        var items = await query.OrderByDescending(p => p.FechaPrestamo).ToListAsync(ct);

        return items.Select(p =>
        {
            var estado = p.FechaDevolucionReal.HasValue
                ? "Devuelto"
                : p.FechaVencimiento < ahora ? "Vencido" : "Activo";

            return new PrestamoDetalleDto(
                p.IdPrestamo, p.FechaPrestamo, p.FechaVencimiento, p.FechaDevolucionReal,
                p.TipoPrestamo, estado, p.IdLector,
                $"{p.Lector.Nombres} {p.Lector.ApellidoPaterno}".Trim(),
                p.Isbn, p.NumeroCopia, p.Ejemplar.Edicion.Libro.Titulo);
        }).ToList();
    }

    public async Task<int> RegistrarPrestamoAsync(RegistrarPrestamoRequest req, CancellationToken ct = default)
    {
        var ahora = RelojPeru.Ahora();
        var isbn = req.Isbn.Trim();
        var tipoPrestamo = req.TipoPrestamo.Trim();

        var lector = await _db.Lectores.FindAsync([req.IdLector], ct)
            ?? throw new NotFoundException($"No existe el lector {req.IdLector}.");

        if (lector.EstadoLector == "Inactivo")
            throw new ReglaNegocioException("El lector está inactivo y no puede solicitar préstamos.");

        if (await _db.Deudas.AnyAsync(d => d.Prestamo.IdLector == lector.IdLector && d.EstadoDeuda == "Pendiente", ct))
            throw new ReglaNegocioException("El lector tiene deudas pendientes.");

        var suspensionVigente = await _db.Deudas
            .Where(d => d.Prestamo.IdLector == lector.IdLector && d.FechaFinSuspension != null && d.EstadoDeuda != "Anulada")
            .MaxAsync(d => d.FechaFinSuspension, ct);

        if (suspensionVigente.HasValue && suspensionVigente.Value > ahora)
            throw new ReglaNegocioException($"El lector está suspendido hasta el {suspensionVigente.Value:dd/MM/yyyy HH:mm}.");

        if (lector.EstadoLector == "Suspendido")
            lector.EstadoLector = "Activo";

        if (await _db.Prestamos.AnyAsync(p => p.IdLector == lector.IdLector && p.FechaDevolucionReal == null && p.FechaVencimiento < ahora, ct))
            throw new ReglaNegocioException("El lector tiene un préstamo vencido sin devolver.");

        var activos = await _db.Prestamos.CountAsync(p => p.IdLector == lector.IdLector && p.FechaDevolucionReal == null, ct);
        var cupo = CalculadoraSanciones.ObtenerCupoMaximo(lector.TipoLector);
        if (activos >= cupo)
            throw new ReglaNegocioException($"El lector alcanzó su límite máximo de {cupo} ejemplares activos.");

        var ejemplar = await _db.Ejemplares.FindAsync([isbn, req.NumeroCopia], ct)
            ?? throw new NotFoundException($"No existe el ejemplar {isbn} copia #{req.NumeroCopia}.");

        if (!EstadoEjemplarFactory.Crear(ejemplar.TipoEstadoFisico).PuedePrestarse)
            throw new ReglaNegocioException($"El ejemplar en estado '{ejemplar.TipoEstadoFisico}' no puede prestarse.");

        if (await _db.Prestamos.AnyAsync(p => p.Isbn == isbn && p.NumeroCopia == req.NumeroCopia && p.FechaDevolucionReal == null, ct))
            throw new ConflictException($"El ejemplar {isbn} copia #{req.NumeroCopia} ya se encuentra prestado.");

        var fechaVencimiento = RelojPeru.CalcularFechaVencimiento(ahora, tipoPrestamo);
        var prestamo = new Prestamo
        {
            FechaPrestamo = ahora,
            FechaVencimiento = fechaVencimiento,
            TipoPrestamo = tipoPrestamo,
            IdLector = lector.IdLector,
            Isbn = isbn,
            NumeroCopia = req.NumeroCopia
        };

        _db.Prestamos.Add(prestamo);
        await _db.SaveChangesAsync(ct);
        return prestamo.IdPrestamo;
    }

    public async Task<DevolucionResultadoDto> RegistrarDevolucionAsync(int idPrestamo, CancellationToken ct = default)
    {
        var ahora = RelojPeru.Ahora();
        var prestamo = await _db.Prestamos
            .Include(p => p.Lector)
            .Include(p => p.Deuda)
            .FirstOrDefaultAsync(p => p.IdPrestamo == idPrestamo, ct)
            ?? throw new NotFoundException($"No existe el préstamo {idPrestamo}.");

        if (prestamo.FechaDevolucionReal.HasValue)
            throw new ConflictException($"El préstamo {idPrestamo} ya fue devuelto.");

        prestamo.FechaDevolucionReal = ahora;
        var diasRetraso = CalculadoraSanciones.CalcularDiasRetraso(prestamo.FechaVencimiento, ahora);

        if (diasRetraso == 0)
        {
            await _db.SaveChangesAsync(ct);
            return new DevolucionResultadoDto(idPrestamo, ahora, 0, null, null, null);
        }

        var diasSuspension = CalculadoraSanciones.CalcularDiasSuspension(diasRetraso);
        var suspensionVigente = await _db.Deudas
            .Where(d => d.Prestamo.IdLector == prestamo.IdLector && d.FechaFinSuspension != null && d.EstadoDeuda != "Anulada")
            .MaxAsync(d => d.FechaFinSuspension, ct);

        var fechaFinSuspension = CalculadoraSanciones.CalcularFechaFinSuspension(ahora, suspensionVigente, diasSuspension);
        var deuda = prestamo.Deuda;
        if (deuda is null)
        {
            deuda = new Deuda
            {
                TarifaDiaria = CalculadoraSanciones.TarifaDiariaBase,
                FechaFinSuspension = fechaFinSuspension,
                EstadoDeuda = "Pendiente",
                IdPrestamo = prestamo.IdPrestamo
            };
            _db.Deudas.Add(deuda);
        }
        else
        {
            deuda.FechaFinSuspension = fechaFinSuspension;
        }

        prestamo.Lector.EstadoLector = "Suspendido";
        await _db.SaveChangesAsync(ct);

        var monto = CalculadoraSanciones.CalcularMontoDeuda(diasRetraso, deuda.TarifaDiaria);
        return new DevolucionResultadoDto(idPrestamo, ahora, diasRetraso, deuda.IdDeuda, monto, fechaFinSuspension);
    }
}
