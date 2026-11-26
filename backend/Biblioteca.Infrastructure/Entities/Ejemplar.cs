namespace Biblioteca.Infrastructure.Entities;

public class Ejemplar
{
    public string Isbn { get; set; } = string.Empty;
    public short NumeroCopia { get; set; }
    public string TipoEstadoFisico { get; set; } = "Bueno";
    public int IdFacultad { get; set; }

    public Edicion Edicion { get; set; } = null!;
    public Facultad Facultad { get; set; } = null!;
    public ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();
}
