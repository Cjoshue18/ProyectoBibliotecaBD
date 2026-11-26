using Biblioteca.Application.Domain.EstadosEjemplar;
using Biblioteca.Application.Exceptions;

namespace Biblioteca.Tests;

public class EstadoEjemplarTests
{
    [Theory]
    [InlineData("Bueno", "Regular")]
    [InlineData("Bueno", "Dañado")]
    [InlineData("Regular", "Dañado")]
    [InlineData("Dañado", "En Reparacion")]
    [InlineData("En Reparacion", "Bueno")]
    [InlineData("En Reparacion", "Regular")]
    public void TransicionarA_CuandoEsValida_RetornaNuevoEstado(string origen, string destino)
    {
        var estadoActual = EstadoEjemplarFactory.Crear(origen);

        var siguiente = estadoActual.TransicionarA(destino);

        Assert.Equal(destino, siguiente.Nombre);
    }

    [Theory]
    [InlineData("Bueno", "En Reparacion")]
    [InlineData("Bueno", "Bueno")]
    [InlineData("Regular", "Bueno")]
    [InlineData("Regular", "En Reparacion")]
    [InlineData("Dañado", "Bueno")]
    [InlineData("Dañado", "Regular")]
    [InlineData("En Reparacion", "Dañado")]
    public void TransicionarA_CuandoEsInvalida_LanzaReglaNegocioException(string origen, string destino)
    {
        var estadoActual = EstadoEjemplarFactory.Crear(origen);

        Assert.Throws<ReglaNegocioException>(() => estadoActual.TransicionarA(destino));
    }

    [Theory]
    [InlineData("Bueno", true)]
    [InlineData("Regular", true)]
    [InlineData("Dañado", false)]
    [InlineData("En Reparacion", false)]
    public void PuedePrestarse_RespetaRegla12(string estado, bool esperado)
    {
        var instancia = EstadoEjemplarFactory.Crear(estado);

        Assert.Equal(esperado, instancia.PuedePrestarse);
    }

    [Fact]
    public void Crear_EstadoDesconocido_LanzaReglaNegocioException()
    {
        Assert.Throws<ReglaNegocioException>(() => EstadoEjemplarFactory.Crear("Extraviado"));
    }
}
