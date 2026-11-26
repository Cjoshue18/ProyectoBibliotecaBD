using Biblioteca.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace Biblioteca.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly DatabaseHealthChecker _healthChecker;

    public HealthController(DatabaseHealthChecker healthChecker)
    {
        _healthChecker = healthChecker;
    }

    [HttpGet("db")]
    public async Task<IActionResult> CheckDatabase(CancellationToken cancellationToken)
    {
        var (canConnect, facultadesCount) = await _healthChecker.CheckAsync(cancellationToken);
        if (!canConnect)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "Error",
                message = "No se pudo conectar a Azure SQL Database."
            });
        }

        return Ok(new
        {
            status = "Healthy",
            database = "Azure SQL / SQL Server",
            facultadesRegistradas = facultadesCount
        });
    }
}
