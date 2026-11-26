using Biblioteca.Application.DTOs.Circulacion;
using Biblioteca.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeudasController : ControllerBase
{
    private readonly DeudaPagoService _service;

    public DeudasController(DeudaPagoService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DeudaDetalleDto>>> Listar(
        [FromQuery] int? idLector,
        [FromQuery] string? estado,
        CancellationToken ct) =>
        Ok(await _service.ListarDeudasAsync(idLector, estado, ct));

    [HttpPatch("{idDeuda:int}/anular")]
    public async Task<IActionResult> Anular(int idDeuda, CancellationToken ct)
    {
        await _service.AnularDeudaAsync(idDeuda, ct);
        return NoContent();
    }
}
