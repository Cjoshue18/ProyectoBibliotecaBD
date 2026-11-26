namespace Biblioteca.Infrastructure.Entities;

public class Editorial
{
    public int IdEditorial { get; set; }
    public string NombreEditorial { get; set; } = string.Empty;
    public string PaisOrigen { get; set; } = string.Empty;

    public ICollection<Edicion> Ediciones { get; set; } = new List<Edicion>();
}
