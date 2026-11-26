namespace Biblioteca.Infrastructure.Entities;

public class Edicion
{
    public string Isbn { get; set; } = string.Empty;
    public short NumeroEdicion { get; set; }
    public short AnioPublicacion { get; set; }
    public int IdEditorial { get; set; }
    public int IdLibro { get; set; }

    public Editorial Editorial { get; set; } = null!;
    public Libro Libro { get; set; } = null!;
    public ICollection<Ejemplar> Ejemplares { get; set; } = new List<Ejemplar>();
}
