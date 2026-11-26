using Biblioteca.Application.DTOs.Circulacion;
using Biblioteca.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PrestamosController : ControllerBase
{
    private readonly PrestamoService _service;

    public PrestamosController(PrestamoService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PrestamoDetalleDto>>> Listar(
        [FromQuery] bool? soloActivos,
        [FromQuery] int? idLector,
        CancellationToken ct) =>
        Ok(await _service.ListarAsync(soloActivos, idLector, ct));

    [HttpPost]
    public async Task<IActionResult> Registrar(RegistrarPrestamoRequest req, CancellationToken ct)
    {
        var id = await _service.RegistrarPrestamoAsync(req, ct);
        return CreatedAtAction(nameof(Listar), new { id });
    }

    [HttpPost("{idPrestamo:int}/devolucion")]
    public async Task<ActionResult<DevolucionResultadoDto>> RegistrarDevolucion(int idPrestamo, CancellationToken ct) =>
        Ok(await _service.RegistrarDevolucionAsync(idPrestamo, ct));
}
