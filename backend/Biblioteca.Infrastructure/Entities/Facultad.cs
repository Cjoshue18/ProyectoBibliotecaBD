namespace Biblioteca.Infrastructure.Entities;

public class Facultad
{
    public int IdFacultad { get; set; }
    public string NombreFacultad { get; set; } = string.Empty;

    public ICollection<Lector> Lectores { get; set; } = new List<Lector>();
    public ICollection<Ejemplar> Ejemplares { get; set; } = new List<Ejemplar>();
}
