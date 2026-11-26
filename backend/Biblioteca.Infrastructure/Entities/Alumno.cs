namespace Biblioteca.Infrastructure.Entities;

public class Alumno
{
    public int IdLector { get; set; }
    public string CodigoAlumno { get; set; } = string.Empty;
    public byte Ciclo { get; set; }

    public Lector Lector { get; set; } = null!;
}
