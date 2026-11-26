using Biblioteca.Application.DTOs.Catalogo;
using Biblioteca.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogoController : ControllerBase
{
    private readonly CatalogoService _service;

    public CatalogoController(CatalogoService service) => _service = service;

    [HttpGet("facultades")]
    public async Task<ActionResult<IReadOnlyList<FacultadDto>>> ListarFacultades(CancellationToken ct) =>
        Ok(await _service.ListarFacultadesAsync(ct));

    [HttpPost("facultades")]
    public async Task<ActionResult<FacultadDto>> CrearFacultad(GuardarFacultadRequest req, CancellationToken ct)
    {
        var created = await _service.CrearFacultadAsync(req, ct);
        return CreatedAtAction(nameof(ListarFacultades), created);
    }

    [HttpGet("editoriales")]
    public async Task<ActionResult<IReadOnlyList<EditorialDto>>> ListarEditoriales(CancellationToken ct) =>
        Ok(await _service.ListarEditorialesAsync(ct));

    [HttpPost("editoriales")]
    public async Task<ActionResult<EditorialDto>> CrearEditorial(GuardarEditorialRequest req, CancellationToken ct)
    {
        var created = await _service.CrearEditorialAsync(req, ct);
        return CreatedAtAction(nameof(ListarEditoriales), created);
    }

    [HttpGet("autores")]
    public async Task<ActionResult<IReadOnlyList<AutorDto>>> ListarAutores(CancellationToken ct) =>
        Ok(await _service.ListarAutoresAsync(ct));

    [HttpPost("autores")]
    public async Task<ActionResult<AutorDto>> CrearAutor(GuardarAutorRequest req, CancellationToken ct)
    {
        var created = await _service.CrearAutorAsync(req, ct);
        return CreatedAtAction(nameof(ListarAutores), created);
    }

    [HttpGet("libros")]
    public async Task<ActionResult<IReadOnlyList<LibroCatalogoDto>>> ListarCatalogo([FromQuery] string? q, CancellationToken ct) =>
        Ok(await _service.ListarCatalogoAsync(q, ct));

    [HttpPost("libros")]
    public async Task<IActionResult> CrearLibro(CrearLibroRequest req, CancellationToken ct)
    {
        var id = await _service.CrearLibroAsync(req, ct);
        return CreatedAtAction(nameof(ListarCatalogo), new { id });
    }

    [HttpPut("libros/{idLibro:int}")]
    public async Task<IActionResult> ActualizarLibro(int idLibro, ActualizarLibroRequest req, CancellationToken ct)
    {
        await _service.ActualizarLibroAsync(idLibro, req, ct);
        return NoContent();
    }

    [HttpPost("ediciones")]
    public async Task<IActionResult> CrearEdicion(CrearEdicionRequest req, CancellationToken ct)
    {
        await _service.CrearEdicionAsync(req, ct);
        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPost("ejemplares")]
    public async Task<IActionResult> CrearEjemplar(CrearEjemplarRequest req, CancellationToken ct)
    {
        await _service.CrearEjemplarAsync(req, ct);
        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPatch("ejemplares/{isbn}/{numeroCopia:int}/estado")]
    public async Task<IActionResult> CambiarEstadoEjemplar(string isbn, short numeroCopia, CambiarEstadoEjemplarRequest req, CancellationToken ct)
    {
        var estado = await _service.CambiarEstadoEjemplarAsync(isbn, numeroCopia, req, ct);
        return Ok(new { isbn, numeroCopia, tipoEstadoFisico = estado });
    }

    [HttpPatch("ejemplares/{isbn}/{numeroCopia:int}/facultad")]
    public async Task<IActionResult> TrasladarEjemplar(string isbn, short numeroCopia, TrasladarEjemplarRequest req, CancellationToken ct)
    {
        await _service.TrasladarEjemplarAsync(isbn, numeroCopia, req, ct);
        return NoContent();
    }
}
