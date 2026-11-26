namespace Biblioteca.Infrastructure.Entities;

public class Prestamo
{
    public int IdPrestamo { get; set; }
    public DateTime FechaPrestamo { get; set; }
    public DateTime FechaVencimiento { get; set; }
    public DateTime? FechaDevolucionReal { get; set; }
    public string TipoPrestamo { get; set; } = string.Empty;
    public int IdLector { get; set; }
    public string Isbn { get; set; } = string.Empty;
    public short NumeroCopia { get; set; }

    public Lector Lector { get; set; } = null!;
    public Ejemplar Ejemplar { get; set; } = null!;
    public Deuda? Deuda { get; set; }
}
