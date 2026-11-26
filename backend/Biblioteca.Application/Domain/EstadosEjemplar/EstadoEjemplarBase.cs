using Biblioteca.Application.Exceptions;

namespace Biblioteca.Application.Domain.EstadosEjemplar;

public abstract class EstadoEjemplarBase : IEstadoEjemplar
{
    public abstract string Nombre { get; }
    public abstract bool PuedePrestarse { get; }
    protected abstract IReadOnlySet<string> TransicionesPermitidas { get; }

    public IEstadoEjemplar TransicionarA(string nuevoEstado)
    {
        if (!TransicionesPermitidas.Contains(nuevoEstado))
        {
            throw new ReglaNegocioException(
                $"Transición de estado inválida: un ejemplar en estado '{Nombre}' no puede pasar a '{nuevoEstado}'.");
        }

        return EstadoEjemplarFactory.Crear(nuevoEstado);
    }
}
