using Biblioteca.Application.Domain;
using Biblioteca.Application.DTOs.Lectores;
using Biblioteca.Application.Exceptions;
using Biblioteca.Infrastructure.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Application.Services;

public class LectorService
{
    private readonly BibliotecaDbContext _db;

    public LectorService(BibliotecaDbContext db) => _db = db;

    public async Task<IReadOnlyList<LectorResumenDto>> ListarAsync(string? q, CancellationToken ct = default)
    {
        var query = _db.Lectores.AsNoTracking()
            .Include(l => l.Facultad)
            .Include(l => l.Alumno)
            .Include(l => l.Docente)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(l =>
                l.NumeroDoc.Contains(term) ||
                l.ApellidoPaterno.Contains(term) ||
                l.Nombres.Contains(term) ||
                (l.Alumno != null && l.Alumno.CodigoAlumno.Contains(term)));
        }

        return await query.OrderBy(l => l.ApellidoPaterno).ThenBy(l => l.Nombres)
            .Select(l => new LectorResumenDto(
                l.IdLector, l.TipoDoc, l.NumeroDoc,
                $"{l.Nombres} {l.ApellidoPaterno} {l.ApellidoMaterno}".Trim(),
                l.CorreoInstitucional, l.TipoLector, l.EstadoLector,
                l.Facultad.NombreFacultad,
                l.Alumno != null ? l.Alumno.CodigoAlumno : null,
                l.Alumno != null ? l.Alumno.Ciclo : null,
                l.Docente != null ? l.Docente.CategoriaDocente : null))
            .ToListAsync(ct);
    }

    public async Task<int> RegistrarAlumnoAsync(RegistrarAlumnoRequest req, CancellationToken ct = default)
    {
        LectorValidaciones.ValidarDocumento(req.TipoDoc.Trim(), req.NumeroDoc.Trim());
        LectorValidaciones.ValidarCorreoInstitucional(req.CorreoInstitucional.Trim());
        LectorValidaciones.ValidarCodigoAlumno(req.CodigoAlumno.Trim());
        await ValidarUnicidadYFacultadAsync(req.TipoDoc.Trim(), req.NumeroDoc.Trim(), req.CorreoInstitucional.Trim(), req.IdFacultad, ct);

        if (await _db.Alumnos.AnyAsync(a => a.CodigoAlumno == req.CodigoAlumno.Trim(), ct))
            throw new ConflictException($"Ya existe un alumno con código '{req.CodigoAlumno}'.");

        var lector = CrearEntidadLector(req.TipoDoc, req.NumeroDoc, req.Nombres, req.ApellidoPaterno, req.ApellidoMaterno,
            req.CorreoInstitucional, req.Telefono, req.Direccion, "Alumno", req.IdFacultad);
        lector.Alumno = new Alumno { CodigoAlumno = req.CodigoAlumno.Trim(), Ciclo = req.Ciclo };

        _db.Lectores.Add(lector);
        await _db.SaveChangesAsync(ct);
        return lector.IdLector;
    }

    public async Task<int> RegistrarDocenteAsync(RegistrarDocenteRequest req, CancellationToken ct = default)
    {
        LectorValidaciones.ValidarDocumento(req.TipoDoc.Trim(), req.NumeroDoc.Trim());
        LectorValidaciones.ValidarCorreoInstitucional(req.CorreoInstitucional.Trim());
        LectorValidaciones.ValidarCategoriaDocente(req.CategoriaDocente.Trim());
        await ValidarUnicidadYFacultadAsync(req.TipoDoc.Trim(), req.NumeroDoc.Trim(), req.CorreoInstitucional.Trim(), req.IdFacultad, ct);

        var lector = CrearEntidadLector(req.TipoDoc, req.NumeroDoc, req.Nombres, req.ApellidoPaterno, req.ApellidoMaterno,
            req.CorreoInstitucional, req.Telefono, req.Direccion, "Docente", req.IdFacultad);
        lector.Docente = new Docente { CategoriaDocente = req.CategoriaDocente.Trim() };

        _db.Lectores.Add(lector);
        await _db.SaveChangesAsync(ct);
        return lector.IdLector;
    }

    public async Task ActualizarAsync(int idLector, ActualizarLectorRequest req, CancellationToken ct = default)
    {
        var lector = await _db.Lectores.Include(l => l.Alumno).Include(l => l.Docente)
            .FirstOrDefaultAsync(l => l.IdLector == idLector, ct)
            ?? throw new NotFoundException($"No existe el lector {idLector}.");

        lector.Telefono = req.Telefono?.Trim();
        lector.Direccion = req.Direccion?.Trim();

        if (lector.TipoLector == "Alumno" && req.Ciclo.HasValue && lector.Alumno is not null)
            lector.Alumno.Ciclo = req.Ciclo.Value;

        if (lector.TipoLector == "Docente" && !string.IsNullOrWhiteSpace(req.CategoriaDocente) && lector.Docente is not null)
        {
            LectorValidaciones.ValidarCategoriaDocente(req.CategoriaDocente.Trim());
            lector.Docente.CategoriaDocente = req.CategoriaDocente.Trim();
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task CambiarEstadoAsync(int idLector, CambiarEstadoLectorRequest req, CancellationToken ct = default)
    {
        var estado = req.NuevoEstado.Trim();
        if (estado is not ("Activo" or "Inactivo"))
            throw new ReglaNegocioException("Solo se puede cambiar manualmente el estado a 'Activo' o 'Inactivo'.");

        var lector = await _db.Lectores.FindAsync([idLector], ct)
            ?? throw new NotFoundException($"No existe el lector {idLector}.");

        if (lector.EstadoLector == "Suspendido" && estado == "Activo")
            throw new ReglaNegocioException("Un lector suspendido por mora solo se reactiva tras cumplir su sanción y pagar su deuda.");

        lector.EstadoLector = estado;
        await _db.SaveChangesAsync(ct);
    }

    private async Task ValidarUnicidadYFacultadAsync(string tipoDoc, string numeroDoc, string correo, int idFacultad, CancellationToken ct)
    {
        if (!await _db.Facultades.AnyAsync(f => f.IdFacultad == idFacultad, ct))
            throw new NotFoundException($"No existe la facultad {idFacultad}.");
        if (await _db.Lectores.AnyAsync(l => l.TipoDoc == tipoDoc && l.NumeroDoc == numeroDoc, ct))
            throw new ConflictException($"Ya existe un lector con {tipoDoc} '{numeroDoc}'.");
        if (await _db.Lectores.AnyAsync(l => l.CorreoInstitucional == correo, ct))
            throw new ConflictException($"Ya existe un lector con correo '{correo}'.");
    }

    private static Lector CrearEntidadLector(string tipoDoc, string numeroDoc, string nombres, string apPat, string? apMat,
        string correo, string? telefono, string? direccion, string tipoLector, int idFacultad) => new()
    {
        TipoDoc = tipoDoc.Trim(),
        NumeroDoc = numeroDoc.Trim(),
        Nombres = nombres.Trim(),
        ApellidoPaterno = apPat.Trim(),
        ApellidoMaterno = apMat?.Trim(),
        CorreoInstitucional = correo.Trim().ToLowerInvariant(),
        Telefono = telefono?.Trim(),
        Direccion = direccion?.Trim(),
        TipoLector = tipoLector,
        EstadoLector = "Activo",
        IdFacultad = idFacultad
    };
}
