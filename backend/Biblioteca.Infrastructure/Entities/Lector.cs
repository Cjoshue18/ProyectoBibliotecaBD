namespace Biblioteca.Infrastructure.Entities;

public class Lector
{
    public int IdLector { get; set; }
    public string TipoDoc { get; set; } = string.Empty;
    public string NumeroDoc { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string? ApellidoMaterno { get; set; }
    public string CorreoInstitucional { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public string TipoLector { get; set; } = string.Empty;
    public string EstadoLector { get; set; } = "Activo";
    public int IdFacultad { get; set; }

    public Facultad Facultad { get; set; } = null!;
    public Alumno? Alumno { get; set; }
    public Docente? Docente { get; set; }
    public ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();
}
