using Biblioteca.Application.Domain;
using Biblioteca.Application.Exceptions;

namespace Biblioteca.Tests;

public class CirculacionReglasTests
{
    [Theory]
    [InlineData("Alumno", 3)]
    [InlineData("Docente", 5)]
    public void ObtenerCupoMaximo_RespetaRegla13(string tipoLector, int esperado)
    {
        Assert.Equal(esperado, CalculadoraSanciones.ObtenerCupoMaximo(tipoLector));
    }

    [Fact]
    public void CalcularFechaVencimiento_Sala_MismoDiaALas21()
    {
        var prestamo = new DateTime(2026, 11, 24, 15, 0, 0);

        var vencimiento = RelojPeru.CalcularFechaVencimiento(prestamo, "Sala");

        Assert.Equal(new DateTime(2026, 11, 24, 21, 0, 0), vencimiento);
    }

    [Fact]
    public void CalcularFechaVencimiento_SalaDespuesDeCierre_LanzaReglaNegocioException()
    {
        var prestamo = new DateTime(2026, 11, 24, 21, 30, 0);

        Assert.Throws<ReglaNegocioException>(() => RelojPeru.CalcularFechaVencimiento(prestamo, "Sala"));
    }

    [Fact]
    public void CalcularFechaVencimiento_Domicilio_TresDiasALas21()
    {
        var prestamo = new DateTime(2026, 11, 24, 15, 0, 0);

        var vencimiento = RelojPeru.CalcularFechaVencimiento(prestamo, "Domicilio");

        Assert.Equal(new DateTime(2026, 11, 27, 21, 0, 0), vencimiento);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(1, 3)]
    [InlineData(2, 3)]
    [InlineData(3, 5)]
    [InlineData(4, 7)]
    [InlineData(5, 9)]
    public void CalcularDiasSuspension_RespetaFormulaPorTramos(int diasRetraso, int esperado)
    {
        Assert.Equal(esperado, CalculadoraSanciones.CalcularDiasSuspension(diasRetraso));
    }

    [Fact]
    public void CalcularDiasRetraso_AntesDeVencimiento_EsCero()
    {
        var vencimiento = new DateTime(2026, 11, 27, 21, 0, 0);
        var devolucion = new DateTime(2026, 11, 27, 18, 0, 0);

        Assert.Equal(0, CalculadoraSanciones.CalcularDiasRetraso(vencimiento, devolucion));
    }

    [Fact]
    public void CalcularDiasRetraso_DosDiasDespues_EsDos()
    {
        var vencimiento = new DateTime(2026, 11, 27, 21, 0, 0);
        var devolucion = new DateTime(2026, 11, 29, 10, 0, 0);

        Assert.Equal(2, CalculadoraSanciones.CalcularDiasRetraso(vencimiento, devolucion));
    }

    [Fact]
    public void CalcularFechaFinSuspension_CuandoYaTieneSuspensionVigente_AcumulaDias()
    {
        var devolucion = new DateTime(2026, 11, 25, 16, 0, 0);
        var vigenteHasta = new DateTime(2026, 11, 28, 16, 0, 0);

        var fin = CalculadoraSanciones.CalcularFechaFinSuspension(devolucion, vigenteHasta, 3);

        Assert.Equal(new DateTime(2026, 12, 1, 16, 0, 0), fin);
    }

    [Fact]
    public void CalcularMontoDeuda_MultiplicaDiasPorTarifa()
    {
        Assert.Equal(15.00m, CalculadoraSanciones.CalcularMontoDeuda(3, 5.00m));
    }
}
