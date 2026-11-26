using Biblioteca.Application.Exceptions;

namespace Biblioteca.Application.Domain.EstadosEjemplar;

public static class EstadoEjemplarFactory
{
    public static IEstadoEjemplar Crear(string estado) => estado switch
    {
        "Bueno" => new EstadoBueno(),
        "Regular" => new EstadoRegular(),
        "Dañado" => new EstadoDaniado(),
        "En Reparacion" => new EstadoEnReparacion(),
        _ => throw new ReglaNegocioException($"El estado físico '{estado}' no es válido.")
    };
}
