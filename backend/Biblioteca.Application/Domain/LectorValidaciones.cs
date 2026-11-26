using Biblioteca.Application.Exceptions;

namespace Biblioteca.Application.Domain;

public static class LectorValidaciones
{
    private static readonly HashSet<string> TiposDocValidos = new(StringComparer.Ordinal) { "DNI", "Pasaporte", "CE" };
    private static readonly HashSet<string> CategoriasDocenteValidas = new(StringComparer.Ordinal) { "Temporal", "Principal", "Titular" };

    public static void ValidarDocumento(string tipoDoc, string numeroDoc)
    {
        if (!TiposDocValidos.Contains(tipoDoc))
            throw new ReglaNegocioException($"Tipo de documento inválido: '{tipoDoc}'.");

        if (string.IsNullOrWhiteSpace(numeroDoc))
            throw new ReglaNegocioException("El número de documento es obligatorio.");

        if (tipoDoc == "DNI" && (numeroDoc.Length != 8 || !numeroDoc.All(char.IsAsciiDigit)))
            throw new ReglaNegocioException("El DNI debe tener exactamente 8 dígitos numéricos.");
    }

    public static void ValidarCorreoInstitucional(string correo)
    {
        if (string.IsNullOrWhiteSpace(correo) || !correo.EndsWith("@urp.edu.pe", StringComparison.OrdinalIgnoreCase))
            throw new ReglaNegocioException("El correo debe pertenecer al dominio @urp.edu.pe.");
    }

    public static void ValidarCodigoAlumno(string codigoAlumno)
    {
        if (string.IsNullOrWhiteSpace(codigoAlumno) || codigoAlumno.Length != 9 || !codigoAlumno.All(char.IsAsciiDigit))
            throw new ReglaNegocioException("El código de alumno debe tener exactamente 9 dígitos numéricos.");
    }

    public static void ValidarCategoriaDocente(string categoria)
    {
        if (!CategoriasDocenteValidas.Contains(categoria))
            throw new ReglaNegocioException($"Categoría docente inválida: '{categoria}'.");
    }
}
