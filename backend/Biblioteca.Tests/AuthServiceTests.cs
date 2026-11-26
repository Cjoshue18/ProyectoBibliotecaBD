using Biblioteca.Application.DTOs.Auth;
using Biblioteca.Application.Exceptions;
using Biblioteca.Application.Services;
using Microsoft.Extensions.Configuration;

namespace Biblioteca.Tests;

public class AuthServiceTests
{
    private static AuthService CrearServicio(string? password)
    {
        var dict = password is null
            ? new Dictionary<string, string?>()
            : new Dictionary<string, string?> { ["Auth:EncargadoPassword"] = password };

        var config = new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
        return new AuthService(null!, config);
    }

    [Fact]
    public void LoginEncargado_PasswordCorrecta_RetornaSesionEncargado()
    {
        var service = CrearServicio("UrpBiblioteca2026!");

        var sesion = service.LoginEncargado(new LoginEncargadoRequest("UrpBiblioteca2026!"));

        Assert.Equal("Encargado", sesion.Rol);
        Assert.Null(sesion.IdLector);
    }

    [Fact]
    public void LoginEncargado_PasswordIncorrecta_LanzaUnauthorizedException()
    {
        var service = CrearServicio("UrpBiblioteca2026!");

        Assert.Throws<UnauthorizedException>(() =>
            service.LoginEncargado(new LoginEncargadoRequest("clave-mala")));
    }

    [Fact]
    public void LoginEncargado_SinConfiguracion_LanzaInvalidOperationException()
    {
        var service = CrearServicio(null);

        Assert.Throws<InvalidOperationException>(() =>
            service.LoginEncargado(new LoginEncargadoRequest("cualquiera")));
    }
}
