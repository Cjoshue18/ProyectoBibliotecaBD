namespace Biblioteca.Application.Domain.EstadosEjemplar;

/// <summary>
/// Contrato del patrón State para el ciclo de vida físico de un ejemplar.
/// </summary>
public interface IEstadoEjemplar
{
    string Nombre { get; }
    bool PuedePrestarse { get; }
    IEstadoEjemplar TransicionarA(string nuevoEstado);
}
