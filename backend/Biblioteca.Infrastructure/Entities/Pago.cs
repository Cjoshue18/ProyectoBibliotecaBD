namespace Biblioteca.Infrastructure.Entities;

public class Pago
{
    public int IdPago { get; set; }
    public string NumeroRecibo { get; set; } = string.Empty;
    public DateTime FechaPago { get; set; }
    public decimal MontoPagado { get; set; }
    public int IdDeuda { get; set; }

    public Deuda Deuda { get; set; } = null!;
}
