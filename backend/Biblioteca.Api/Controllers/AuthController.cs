using Biblioteca.Application.DTOs.Auth;
using Biblioteca.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _service;

    public AuthController(AuthService service) => _service = service;

    [HttpPost("login-lector")]
    public async Task<ActionResult<AuthSessionDto>> LoginLector(LoginLectorRequest req, CancellationToken ct) =>
        Ok(await _service.LoginLectorAsync(req, ct));

    [HttpPost("login-encargado")]
    public ActionResult<AuthSessionDto> LoginEncargado(LoginEncargadoRequest req) =>
        Ok(_service.LoginEncargado(req));
}
