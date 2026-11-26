using System.ComponentModel.DataAnnotations;

namespace Biblioteca.Application.DTOs.Circulacion;

public record PrestamoDetalleDto(
    int IdPrestamo,
    DateTime FechaPrestamo,
    DateTime FechaVencimiento,
    DateTime? FechaDevolucionReal,
    string TipoPrestamo,
    string EstadoDerivado,
    int IdLector,
    string NombreLector,
    string Isbn,
    short NumeroCopia,
    string TituloLibro);

public record RegistrarPrestamoRequest(
    int IdLector,
    [Required, MaxLength(20)] string Isbn,
    short NumeroCopia,
    [Required] string TipoPrestamo);

public record DevolucionResultadoDto(
    int IdPrestamo,
    DateTime FechaDevolucionReal,
    int DiasRetraso,
    int? IdDeuda,
    decimal? MontoGenerado,
    DateTime? FechaFinSuspension);

public record DeudaDetalleDto(
    int IdDeuda,
    int IdPrestamo,
    int IdLector,
    string NombreLector,
    string TituloLibro,
    decimal TarifaDiaria,
    int DiasRetraso,
    decimal MontoCalculado,
    DateTime? FechaFinSuspension,
    string EstadoDeuda);

public record RegistrarPagoRequest(
    int IdDeuda,
    [Required, MaxLength(20)] string NumeroRecibo);

public record PagoDto(
    int IdPago,
    string NumeroRecibo,
    DateTime FechaPago,
    decimal MontoPagado,
    int IdDeuda);
