using Biblioteca.Application.DTOs.Circulacion;
using Biblioteca.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private readonly DeudaPagoService _service;

    public PagosController(DeudaPagoService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PagoDto>>> Listar([FromQuery] int? idLector, CancellationToken ct) =>
        Ok(await _service.ListarPagosAsync(idLector, ct));

    [HttpPost]
    public async Task<ActionResult<PagoDto>> Registrar(RegistrarPagoRequest req, CancellationToken ct)
    {
        var pago = await _service.RegistrarPagoAsync(req, ct);
        return CreatedAtAction(nameof(Listar), pago);
    }
}
