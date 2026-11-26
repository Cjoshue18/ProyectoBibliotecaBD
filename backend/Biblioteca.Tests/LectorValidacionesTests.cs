using Biblioteca.Application.Domain;
using Biblioteca.Application.Exceptions;

namespace Biblioteca.Tests;

public class LectorValidacionesTests
{
    [Fact]
    public void ValidarDocumento_DniDe8Digitos_EsValido()
    {
        LectorValidaciones.ValidarDocumento("DNI", "71234561");
    }

    [Theory]
    [InlineData("DNI", "1234567")]
    [InlineData("DNI", "123456789")]
    [InlineData("DNI", "7123456A")]
    [InlineData("Carnet", "12345678")]
    public void ValidarDocumento_Invalido_LanzaReglaNegocioException(string tipoDoc, string numeroDoc)
    {
        Assert.Throws<ReglaNegocioException>(() => LectorValidaciones.ValidarDocumento(tipoDoc, numeroDoc));
    }

    [Theory]
    [InlineData("202210101")]
    [InlineData("000123456")]
    public void ValidarCodigoAlumno_9Digitos_EsValido(string codigo)
    {
        LectorValidaciones.ValidarCodigoAlumno(codigo);
    }

    [Theory]
    [InlineData("20221010")]
    [InlineData("20221010A")]
    public void ValidarCodigoAlumno_Invalido_LanzaReglaNegocioException(string codigo)
    {
        Assert.Throws<ReglaNegocioException>(() => LectorValidaciones.ValidarCodigoAlumno(codigo));
    }

    [Fact]
    public void ValidarCorreoInstitucional_DominioIncorrecto_LanzaReglaNegocioException()
    {
        Assert.Throws<ReglaNegocioException>(() => LectorValidaciones.ValidarCorreoInstitucional("juan@gmail.com"));
    }
}
