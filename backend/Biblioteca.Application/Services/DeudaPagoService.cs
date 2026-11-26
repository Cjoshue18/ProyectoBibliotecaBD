using Biblioteca.Application.Domain;
using Biblioteca.Application.DTOs.Circulacion;
using Biblioteca.Application.Exceptions;
using Biblioteca.Infrastructure.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Application.Services;

public class DeudaPagoService
{
    private readonly BibliotecaDbContext _db;

    public DeudaPagoService(BibliotecaDbContext db) => _db = db;

    public async Task<IReadOnlyList<DeudaDetalleDto>> ListarDeudasAsync(int? idLector, string? estado, CancellationToken ct = default)
    {
        var ahora = RelojPeru.Ahora();
        var query = _db.Deudas.AsNoTracking()
            .Include(d => d.Prestamo).ThenInclude(p => p.Lector)
            .Include(d => d.Prestamo).ThenInclude(p => p.Ejemplar).ThenInclude(e => e.Edicion).ThenInclude(ed => ed.Libro)
            .AsQueryable();

        if (idLector.HasValue)
            query = query.Where(d => d.Prestamo.IdLector == idLector.Value);
        if (!string.IsNullOrWhiteSpace(estado))
            query = query.Where(d => d.EstadoDeuda == estado.Trim());

        var deudas = await query.OrderByDescending(d => d.IdDeuda).ToListAsync(ct);

        return deudas.Select(d =>
        {
            var fechaCorte = d.Prestamo.FechaDevolucionReal ?? ahora;
            var dias = CalculadoraSanciones.CalcularDiasRetraso(d.Prestamo.FechaVencimiento, fechaCorte);
            var monto = CalculadoraSanciones.CalcularMontoDeuda(dias, d.TarifaDiaria);

            return new DeudaDetalleDto(
                d.IdDeuda, d.IdPrestamo, d.Prestamo.IdLector,
                $"{d.Prestamo.Lector.Nombres} {d.Prestamo.Lector.ApellidoPaterno}".Trim(),
                d.Prestamo.Ejemplar.Edicion.Libro.Titulo,
                d.TarifaDiaria, dias, monto, d.FechaFinSuspension, d.EstadoDeuda);
        }).ToList();
    }

    public async Task AnularDeudaAsync(int idDeuda, CancellationToken ct = default)
    {
        var ahora = RelojPeru.Ahora();
        var deuda = await _db.Deudas
            .Include(d => d.Prestamo).ThenInclude(p => p.Lector)
            .FirstOrDefaultAsync(d => d.IdDeuda == idDeuda, ct)
            ?? throw new NotFoundException($"No existe la deuda {idDeuda}.");

        if (deuda.EstadoDeuda != "Pendiente")
            throw new ConflictException($"Solo se pueden anular deudas en estado 'Pendiente' (actual: '{deuda.EstadoDeuda}').");

        deuda.EstadoDeuda = "Anulada";
        await IntentarReactivarLectorAsync(deuda.Prestamo.Lector, idDeuda, ahora, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<PagoDto>> ListarPagosAsync(int? idLector, CancellationToken ct = default)
    {
        var query = _db.Pagos.AsNoTracking().AsQueryable();
        if (idLector.HasValue)
            query = query.Where(p => p.Deuda.Prestamo.IdLector == idLector.Value);

        return await query.OrderByDescending(p => p.FechaPago)
            .Select(p => new PagoDto(p.IdPago, p.NumeroRecibo, p.FechaPago, p.MontoPagado, p.IdDeuda))
            .ToListAsync(ct);
    }

    public async Task<PagoDto> RegistrarPagoAsync(RegistrarPagoRequest req, CancellationToken ct = default)
    {
        var ahora = RelojPeru.Ahora();
        var numeroRecibo = req.NumeroRecibo.Trim();

        var deuda = await _db.Deudas
            .Include(d => d.Prestamo).ThenInclude(p => p.Lector)
            .Include(d => d.Pago)
            .FirstOrDefaultAsync(d => d.IdDeuda == req.IdDeuda, ct)
            ?? throw new NotFoundException($"No existe la deuda {req.IdDeuda}.");

        if (deuda.EstadoDeuda != "Pendiente" || deuda.Pago is not null)
            throw new ConflictException($"La deuda {req.IdDeuda} no está pendiente de pago.");

        if (!deuda.Prestamo.FechaDevolucionReal.HasValue)
            throw new ReglaNegocioException("El ejemplar debe ser devuelto antes de pagar la deuda.");

        if (await _db.Pagos.AnyAsync(p => p.NumeroRecibo == numeroRecibo, ct))
            throw new ConflictException($"Ya existe un pago registrado con el recibo '{numeroRecibo}'.");

        var dias = CalculadoraSanciones.CalcularDiasRetraso(deuda.Prestamo.FechaVencimiento, deuda.Prestamo.FechaDevolucionReal.Value);
        var monto = CalculadoraSanciones.CalcularMontoDeuda(dias, deuda.TarifaDiaria);
        if (monto <= 0)
            throw new ReglaNegocioException("El monto calculado de la deuda debe ser mayor a cero.");

        var pago = new Pago
        {
            NumeroRecibo = numeroRecibo,
            FechaPago = ahora,
            MontoPagado = monto,
            IdDeuda = deuda.IdDeuda
        };

        deuda.EstadoDeuda = "Pagada";
        _db.Pagos.Add(pago);
        await IntentarReactivarLectorAsync(deuda.Prestamo.Lector, deuda.IdDeuda, ahora, ct);
        await _db.SaveChangesAsync(ct);

        return new PagoDto(pago.IdPago, pago.NumeroRecibo, pago.FechaPago, pago.MontoPagado, pago.IdDeuda);
    }

    private async Task IntentarReactivarLectorAsync(Lector lector, int idDeudaResuelta, DateTime ahora, CancellationToken ct)
    {
        if (lector.EstadoLector != "Suspendido")
            return;

        var tieneOtrasPendientes = await _db.Deudas.AnyAsync(
            d => d.Prestamo.IdLector == lector.IdLector && d.IdDeuda != idDeudaResuelta && d.EstadoDeuda == "Pendiente", ct);
        if (tieneOtrasPendientes)
            return;

        var suspensionVigente = await _db.Deudas
            .Where(d => d.Prestamo.IdLector == lector.IdLector && d.IdDeuda != idDeudaResuelta
                && d.EstadoDeuda != "Anulada" && d.FechaFinSuspension != null)
            .MaxAsync(d => d.FechaFinSuspension, ct);

        if (suspensionVigente.HasValue && suspensionVigente.Value > ahora)
            return;

        var deudaActual = await _db.Deudas.FindAsync([idDeudaResuelta], ct);
        if (deudaActual is { EstadoDeuda: "Pagada", FechaFinSuspension: not null } && deudaActual.FechaFinSuspension.Value > ahora)
            return;

        lector.EstadoLector = "Activo";
    }
}
