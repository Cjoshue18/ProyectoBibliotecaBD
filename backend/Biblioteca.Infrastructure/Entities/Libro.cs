namespace Biblioteca.Infrastructure.Entities;

public class Libro
{
    public int IdLibro { get; set; }
    public string Titulo { get; set; } = string.Empty;

    public ICollection<LibroAutor> LibroAutores { get; set; } = new List<LibroAutor>();
    public ICollection<Edicion> Ediciones { get; set; } = new List<Edicion>();
}
