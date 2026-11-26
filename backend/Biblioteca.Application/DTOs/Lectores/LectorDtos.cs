using System.ComponentModel.DataAnnotations;

namespace Biblioteca.Application.DTOs.Lectores;

public record LectorResumenDto(
    int IdLector,
    string TipoDoc,
    string NumeroDoc,
    string NombreCompleto,
    string CorreoInstitucional,
    string TipoLector,
    string EstadoLector,
    string NombreFacultad,
    string? CodigoAlumno,
    byte? Ciclo,
    string? CategoriaDocente);

public record RegistrarAlumnoRequest(
    [Required] string TipoDoc,
    [Required, MaxLength(20)] string NumeroDoc,
    [Required, MaxLength(100)] string Nombres,
    [Required, MaxLength(50)] string ApellidoPaterno,
    [MaxLength(50)] string? ApellidoMaterno,
    [Required, MaxLength(100)] string CorreoInstitucional,
    [MaxLength(15)] string? Telefono,
    [MaxLength(200)] string? Direccion,
    int IdFacultad,
    [Required, MaxLength(9)] string CodigoAlumno,
    [Range(1, 14)] byte Ciclo);

public record RegistrarDocenteRequest(
    [Required] string TipoDoc,
    [Required, MaxLength(20)] string NumeroDoc,
    [Required, MaxLength(100)] string Nombres,
    [Required, MaxLength(50)] string ApellidoPaterno,
    [MaxLength(50)] string? ApellidoMaterno,
    [Required, MaxLength(100)] string CorreoInstitucional,
    [MaxLength(15)] string? Telefono,
    [MaxLength(200)] string? Direccion,
    int IdFacultad,
    [Required] string CategoriaDocente);

public record ActualizarLectorRequest(
    [MaxLength(15)] string? Telefono,
    [MaxLength(200)] string? Direccion,
    [Range(1, 14)] byte? Ciclo,
    string? CategoriaDocente);

public record CambiarEstadoLectorRequest([Required] string NuevoEstado);
