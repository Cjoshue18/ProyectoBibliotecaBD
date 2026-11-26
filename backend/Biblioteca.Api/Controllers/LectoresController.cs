using Biblioteca.Application.DTOs.Lectores;
using Biblioteca.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LectoresController : ControllerBase
{
    private readonly LectorService _service;

    public LectoresController(LectorService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LectorResumenDto>>> Listar([FromQuery] string? q, CancellationToken ct) =>
        Ok(await _service.ListarAsync(q, ct));

    [HttpPost("alumnos")]
    public async Task<IActionResult> RegistrarAlumno(RegistrarAlumnoRequest req, CancellationToken ct)
    {
        var id = await _service.RegistrarAlumnoAsync(req, ct);
        return CreatedAtAction(nameof(Listar), new { id });
    }

    [HttpPost("docentes")]
    public async Task<IActionResult> RegistrarDocente(RegistrarDocenteRequest req, CancellationToken ct)
    {
        var id = await _service.RegistrarDocenteAsync(req, ct);
        return CreatedAtAction(nameof(Listar), new { id });
    }

    [HttpPut("{idLector:int}")]
    public async Task<IActionResult> Actualizar(int idLector, ActualizarLectorRequest req, CancellationToken ct)
    {
        await _service.ActualizarAsync(idLector, req, ct);
        return NoContent();
    }

    [HttpPatch("{idLector:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int idLector, CambiarEstadoLectorRequest req, CancellationToken ct)
    {
        await _service.CambiarEstadoAsync(idLector, req, ct);
        return NoContent();
    }
}
