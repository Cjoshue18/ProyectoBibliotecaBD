using System.Security.Cryptography;
using System.Text;
using Biblioteca.Application.DTOs.Auth;
using Biblioteca.Application.Exceptions;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Biblioteca.Application.Services;

public class AuthService
{
    private readonly BibliotecaDbContext _db;
    private readonly IConfiguration _configuration;

    public AuthService(BibliotecaDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<AuthSessionDto> LoginLectorAsync(LoginLectorRequest req, CancellationToken ct = default)
    {
        var usuario = req.Usuario.Trim();
        var clave = req.Clave.Trim();

        var lector = await _db.Lectores.AsNoTracking()
            .Include(l => l.Alumno)
            .FirstOrDefaultAsync(l =>
                (l.TipoLector == "Alumno" && l.Alumno != null && l.Alumno.CodigoAlumno == usuario && l.NumeroDoc == clave) ||
                (l.TipoLector == "Docente" && l.NumeroDoc == usuario && l.NumeroDoc == clave),
                ct);

        if (lector is null)
            throw new UnauthorizedException("Credenciales de lector inválidas.");

        if (lector.EstadoLector == "Inactivo")
            throw new UnauthorizedException("El lector se encuentra inactivo.");

        var nombreCompleto = $"{lector.Nombres} {lector.ApellidoPaterno} {lector.ApellidoMaterno}".Trim();
        return new AuthSessionDto(lector.TipoLector, lector.IdLector, nombreCompleto, lector.EstadoLector);
    }

    public AuthSessionDto LoginEncargado(LoginEncargadoRequest req)
    {
        var passwordConfigurada = _configuration["Auth:EncargadoPassword"];
        if (string.IsNullOrEmpty(passwordConfigurada))
            throw new InvalidOperationException("No se configuró 'Auth:EncargadoPassword' en User Secrets.");

        var inputBytes = Encoding.UTF8.GetBytes(req.Password);
        var expectedBytes = Encoding.UTF8.GetBytes(passwordConfigurada);

        if (!CryptographicOperations.FixedTimeEquals(inputBytes, expectedBytes))
            throw new UnauthorizedException("Contraseña de encargado incorrecta.");

        return new AuthSessionDto("Encargado", null, "Encargado de Biblioteca", null);
    }
}
