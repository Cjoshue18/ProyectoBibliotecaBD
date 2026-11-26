namespace Biblioteca.Infrastructure.Entities;

public class Autor
{
    public int IdAutor { get; set; }
    public string NombreAutor { get; set; } = string.Empty;

    public ICollection<LibroAutor> LibroAutores { get; set; } = new List<LibroAutor>();
}
