namespace Biblioteca.Infrastructure.Entities;

public class Deuda
{
    public int IdDeuda { get; set; }
    public decimal TarifaDiaria { get; set; } = 5.00m;
    public DateTime? FechaFinSuspension { get; set; }
    public string EstadoDeuda { get; set; } = "Pendiente";
    public int IdPrestamo { get; set; }

    public Prestamo Prestamo { get; set; } = null!;
    public Pago? Pago { get; set; }
}
