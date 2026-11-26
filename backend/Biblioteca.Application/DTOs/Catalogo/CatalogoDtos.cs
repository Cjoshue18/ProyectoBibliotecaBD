using System.ComponentModel.DataAnnotations;

namespace Biblioteca.Application.DTOs.Catalogo;

public record FacultadDto(int IdFacultad, string NombreFacultad);
public record GuardarFacultadRequest([Required, MaxLength(100)] string NombreFacultad);

public record EditorialDto(int IdEditorial, string NombreEditorial, string PaisOrigen);
public record GuardarEditorialRequest(
    [Required, MaxLength(100)] string NombreEditorial,
    [Required, MaxLength(50)] string PaisOrigen);

public record AutorDto(int IdAutor, string NombreAutor);
public record GuardarAutorRequest([Required, MaxLength(200)] string NombreAutor);

public record EjemplarDto(short NumeroCopia, string TipoEstadoFisico, int IdFacultad, string NombreFacultad, bool Disponible);

public record EdicionCatalogoDto(
    string Isbn,
    short NumeroEdicion,
    short AnioPublicacion,
    int IdEditorial,
    string NombreEditorial,
    IReadOnlyList<EjemplarDto> Ejemplares);

public record LibroCatalogoDto(
    int IdLibro,
    string Titulo,
    IReadOnlyList<AutorDto> Autores,
    IReadOnlyList<EdicionCatalogoDto> Ediciones);

public record CrearLibroRequest(
    [Required, MaxLength(200)] string Titulo,
    [Required, MinLength(1)] IReadOnlyList<int> IdsAutores);

public record ActualizarLibroRequest([Required, MaxLength(200)] string Titulo);

public record CrearEdicionRequest(
    [Required, MaxLength(20)] string Isbn,
    [Range(1, short.MaxValue)] short NumeroEdicion,
    [Range(1900, 2100)] short AnioPublicacion,
    int IdEditorial,
    int IdLibro);

public record CrearEjemplarRequest(
    [Required, MaxLength(20)] string Isbn,
    [Range(1, short.MaxValue)] short NumeroCopia,
    int IdFacultad);

public record CambiarEstadoEjemplarRequest([Required] string NuevoEstado);
public record TrasladarEjemplarRequest(int IdFacultad);
