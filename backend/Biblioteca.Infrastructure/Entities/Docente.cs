namespace Biblioteca.Infrastructure.Entities;

public class Docente
{
    public int IdLector { get; set; }
    public string CategoriaDocente { get; set; } = string.Empty;

    public Lector Lector { get; set; } = null!;
}
