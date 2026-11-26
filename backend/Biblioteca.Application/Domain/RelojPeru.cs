using Biblioteca.Application.Exceptions;

namespace Biblioteca.Application.Domain;

public static class RelojPeru
{
    private static readonly TimeZoneInfo ZonaPeru = ResolverZonaPeru();
    public static readonly TimeSpan HoraCierre = new(21, 0, 0);

    public static DateTime Ahora()
    {
        var peru = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaPeru);
        return new DateTime(peru.Year, peru.Month, peru.Day, peru.Hour, peru.Minute, peru.Second);
    }

    public static DateTime CalcularFechaVencimiento(DateTime fechaPrestamo, string tipoPrestamo)
    {
        var diasPlazo = tipoPrestamo switch
        {
            "Sala" => 0,
            "Domicilio" => 3,
            _ => throw new ReglaNegocioException($"Tipo de préstamo inválido: '{tipoPrestamo}'. Debe ser 'Sala' o 'Domicilio'.")
        };

        var fechaCierre = fechaPrestamo.Date.AddDays(diasPlazo).Add(HoraCierre);
        if (fechaCierre <= fechaPrestamo)
            throw new ReglaNegocioException("No se pueden registrar préstamos en Sala después de la hora de cierre (21:00).");

        return fechaCierre;
    }

    private static TimeZoneInfo ResolverZonaPeru()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time"); }
        catch { return TimeZoneInfo.FindSystemTimeZoneById("America/Lima"); }
    }
}
