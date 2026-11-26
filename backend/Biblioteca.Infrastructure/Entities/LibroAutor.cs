namespace Biblioteca.Infrastructure.Entities;

public class LibroAutor
{
    public int IdLibro { get; set; }
    public int IdAutor { get; set; }

    public Libro Libro { get; set; } = null!;
    public Autor Autor { get; set; } = null!;
}
