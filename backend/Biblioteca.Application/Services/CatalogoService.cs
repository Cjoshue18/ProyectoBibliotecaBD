using Biblioteca.Application.Domain.EstadosEjemplar;
using Biblioteca.Application.DTOs.Catalogo;
using Biblioteca.Application.Exceptions;
using Biblioteca.Infrastructure.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Application.Services;

public class CatalogoService
{
    private readonly BibliotecaDbContext _db;

    public CatalogoService(BibliotecaDbContext db) => _db = db;

    public async Task<IReadOnlyList<FacultadDto>> ListarFacultadesAsync(CancellationToken ct = default) =>
        await _db.Facultades.AsNoTracking()
            .OrderBy(f => f.NombreFacultad)
            .Select(f => new FacultadDto(f.IdFacultad, f.NombreFacultad))
            .ToListAsync(ct);

    public async Task<FacultadDto> CrearFacultadAsync(GuardarFacultadRequest req, CancellationToken ct = default)
    {
        var entity = new Facultad { NombreFacultad = req.NombreFacultad.Trim() };
        _db.Facultades.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new FacultadDto(entity.IdFacultad, entity.NombreFacultad);
    }

    public async Task<IReadOnlyList<EditorialDto>> ListarEditorialesAsync(CancellationToken ct = default) =>
        await _db.Editoriales.AsNoTracking()
            .OrderBy(e => e.NombreEditorial)
            .Select(e => new EditorialDto(e.IdEditorial, e.NombreEditorial, e.PaisOrigen))
            .ToListAsync(ct);

    public async Task<EditorialDto> CrearEditorialAsync(GuardarEditorialRequest req, CancellationToken ct = default)
    {
        var nombre = req.NombreEditorial.Trim();
        if (await _db.Editoriales.AnyAsync(e => e.NombreEditorial == nombre, ct))
            throw new ConflictException($"Ya existe una editorial llamada '{nombre}'.");

        var entity = new Editorial { NombreEditorial = nombre, PaisOrigen = req.PaisOrigen.Trim() };
        _db.Editoriales.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new EditorialDto(entity.IdEditorial, entity.NombreEditorial, entity.PaisOrigen);
    }

    public async Task<IReadOnlyList<AutorDto>> ListarAutoresAsync(CancellationToken ct = default) =>
        await _db.Autores.AsNoTracking()
            .OrderBy(a => a.NombreAutor)
            .Select(a => new AutorDto(a.IdAutor, a.NombreAutor))
            .ToListAsync(ct);

    public async Task<AutorDto> CrearAutorAsync(GuardarAutorRequest req, CancellationToken ct = default)
    {
        var entity = new Autor { NombreAutor = req.NombreAutor.Trim() };
        _db.Autores.Add(entity);
        await _db.SaveChangesAsync(ct);
        return new AutorDto(entity.IdAutor, entity.NombreAutor);
    }

    public async Task<IReadOnlyList<LibroCatalogoDto>> ListarCatalogoAsync(string? q, CancellationToken ct = default)
    {
        var query = _db.Libros.AsNoTracking()
            .Include(l => l.LibroAutores).ThenInclude(la => la.Autor)
            .Include(l => l.Ediciones).ThenInclude(ed => ed.Editorial)
            .Include(l => l.Ediciones).ThenInclude(ed => ed.Ejemplares).ThenInclude(ej => ej.Facultad)
            .Include(l => l.Ediciones).ThenInclude(ed => ed.Ejemplares).ThenInclude(ej => ej.Prestamos)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(l =>
                l.Titulo.Contains(term) ||
                l.LibroAutores.Any(la => la.Autor.NombreAutor.Contains(term)) ||
                l.Ediciones.Any(ed => ed.Isbn.Contains(term)));
        }

        var libros = await query.OrderBy(l => l.Titulo).ToListAsync(ct);

        return libros.Select(l => new LibroCatalogoDto(
            l.IdLibro,
            l.Titulo,
            l.LibroAutores.Select(la => new AutorDto(la.IdAutor, la.Autor.NombreAutor)).ToList(),
            l.Ediciones.Select(ed => new EdicionCatalogoDto(
                ed.Isbn,
                ed.NumeroEdicion,
                ed.AnioPublicacion,
                ed.IdEditorial,
                ed.Editorial.NombreEditorial,
                ed.Ejemplares.OrderBy(ej => ej.NumeroCopia).Select(ej => new EjemplarDto(
                    ej.NumeroCopia,
                    ej.TipoEstadoFisico,
                    ej.IdFacultad,
                    ej.Facultad.NombreFacultad,
                    EstadoEjemplarFactory.Crear(ej.TipoEstadoFisico).PuedePrestarse
                        && !ej.Prestamos.Any(p => p.FechaDevolucionReal == null)
                )).ToList()
            )).ToList()
        )).ToList();
    }

    public async Task<int> CrearLibroAsync(CrearLibroRequest req, CancellationToken ct = default)
    {
        var idsUnicos = req.IdsAutores.Distinct().ToList();
        var autoresExistentes = await _db.Autores.CountAsync(a => idsUnicos.Contains(a.IdAutor), ct);
        if (autoresExistentes != idsUnicos.Count)
            throw new NotFoundException("Uno o más autores indicados no existen.");

        var libro = new Libro { Titulo = req.Titulo.Trim() };
        foreach (var idAutor in idsUnicos)
            libro.LibroAutores.Add(new LibroAutor { IdAutor = idAutor });

        _db.Libros.Add(libro);
        await _db.SaveChangesAsync(ct);
        return libro.IdLibro;
    }

    public async Task ActualizarLibroAsync(int idLibro, ActualizarLibroRequest req, CancellationToken ct = default)
    {
        var libro = await _db.Libros.FindAsync([idLibro], ct)
            ?? throw new NotFoundException($"No existe el libro con id {idLibro}.");
        libro.Titulo = req.Titulo.Trim();
        await _db.SaveChangesAsync(ct);
    }

    public async Task CrearEdicionAsync(CrearEdicionRequest req, CancellationToken ct = default)
    {
        var isbn = req.Isbn.Trim();
        if (await _db.Ediciones.AnyAsync(e => e.Isbn == isbn, ct))
            throw new ConflictException($"Ya existe una edición con ISBN '{isbn}'.");
        if (!await _db.Libros.AnyAsync(l => l.IdLibro == req.IdLibro, ct))
            throw new NotFoundException($"No existe el libro {req.IdLibro}.");
        if (!await _db.Editoriales.AnyAsync(e => e.IdEditorial == req.IdEditorial, ct))
            throw new NotFoundException($"No existe la editorial {req.IdEditorial}.");

        _db.Ediciones.Add(new Edicion
        {
            Isbn = isbn,
            NumeroEdicion = req.NumeroEdicion,
            AnioPublicacion = req.AnioPublicacion,
            IdEditorial = req.IdEditorial,
            IdLibro = req.IdLibro
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task CrearEjemplarAsync(CrearEjemplarRequest req, CancellationToken ct = default)
    {
        var isbn = req.Isbn.Trim();
        if (!await _db.Ediciones.AnyAsync(e => e.Isbn == isbn, ct))
            throw new NotFoundException($"No existe la edición con ISBN '{isbn}'.");
        if (!await _db.Facultades.AnyAsync(f => f.IdFacultad == req.IdFacultad, ct))
            throw new NotFoundException($"No existe la facultad {req.IdFacultad}.");
        if (await _db.Ejemplares.AnyAsync(e => e.Isbn == isbn && e.NumeroCopia == req.NumeroCopia, ct))
            throw new ConflictException($"Ya existe la copia #{req.NumeroCopia} para el ISBN '{isbn}'.");

        _db.Ejemplares.Add(new Ejemplar
        {
            Isbn = isbn,
            NumeroCopia = req.NumeroCopia,
            TipoEstadoFisico = "Bueno",
            IdFacultad = req.IdFacultad
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task<string> CambiarEstadoEjemplarAsync(string isbn, short numeroCopia, CambiarEstadoEjemplarRequest req, CancellationToken ct = default)
    {
        var ejemplar = await _db.Ejemplares.FindAsync([isbn, numeroCopia], ct)
            ?? throw new NotFoundException($"No existe el ejemplar {isbn} copia #{numeroCopia}.");

        var estadoActual = EstadoEjemplarFactory.Crear(ejemplar.TipoEstadoFisico);
        var nuevoEstado = estadoActual.TransicionarA(req.NuevoEstado.Trim());

        ejemplar.TipoEstadoFisico = nuevoEstado.Nombre;
        await _db.SaveChangesAsync(ct);
        return ejemplar.TipoEstadoFisico;
    }

    public async Task TrasladarEjemplarAsync(string isbn, short numeroCopia, TrasladarEjemplarRequest req, CancellationToken ct = default)
    {
        var ejemplar = await _db.Ejemplares.FindAsync([isbn, numeroCopia], ct)
            ?? throw new NotFoundException($"No existe el ejemplar {isbn} copia #{numeroCopia}.");
        if (!await _db.Facultades.AnyAsync(f => f.IdFacultad == req.IdFacultad, ct))
            throw new NotFoundException($"No existe la facultad {req.IdFacultad}.");

        ejemplar.IdFacultad = req.IdFacultad;
        await _db.SaveChangesAsync(ct);
    }
}
