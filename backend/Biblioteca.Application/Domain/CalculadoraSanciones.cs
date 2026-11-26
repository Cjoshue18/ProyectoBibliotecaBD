using Biblioteca.Application.Exceptions;

namespace Biblioteca.Application.Domain;

public static class CalculadoraSanciones
{
    public const decimal TarifaDiariaBase = 5.00m;

    public static int ObtenerCupoMaximo(string tipoLector) => tipoLector switch
    {
        "Alumno" => 3,
        "Docente" => 5,
        _ => throw new ReglaNegocioException($"Tipo de lector inválido: '{tipoLector}'.")
    };

    public static int CalcularDiasRetraso(DateTime fechaVencimiento, DateTime fechaReferencia)
    {
        if (fechaReferencia <= fechaVencimiento)
            return 0;

        var dias = (fechaReferencia.Date - fechaVencimiento.Date).Days;
        return Math.Max(1, dias);
    }

    public static int CalcularDiasSuspension(int diasRetraso)
    {
        if (diasRetraso <= 0)
            return 0;

        return 3 + Math.Max(0, diasRetraso - 2) * 2;
    }

    public static DateTime? CalcularFechaFinSuspension(
        DateTime fechaDevolucion,
        DateTime? suspensionVigenteHasta,
        int diasSuspension)
    {
        if (diasSuspension <= 0)
            return null;

        var fechaBase = suspensionVigenteHasta.HasValue && suspensionVigenteHasta.Value > fechaDevolucion
            ? suspensionVigenteHasta.Value
            : fechaDevolucion;

        return fechaBase.AddDays(diasSuspension);
    }

    public static decimal CalcularMontoDeuda(int diasRetraso, decimal tarifaDiaria) =>
        diasRetraso <= 0 ? 0m : diasRetraso * tarifaDiaria;
}
