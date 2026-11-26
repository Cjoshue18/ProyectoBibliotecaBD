using System.ComponentModel.DataAnnotations;

namespace Biblioteca.Application.DTOs.Auth;

public record LoginLectorRequest(
    [Required] string Usuario,
    [Required] string Clave);

public record LoginEncargadoRequest(
    [Required] string Password);

public record AuthSessionDto(
    string Rol,
    int? IdLector,
    string NombreCompleto,
    string? EstadoLector);
