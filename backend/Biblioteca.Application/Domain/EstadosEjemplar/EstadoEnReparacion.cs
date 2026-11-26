namespace Biblioteca.Application.Domain.EstadosEjemplar;

public sealed class EstadoEnReparacion : EstadoEjemplarBase
{
    private static readonly HashSet<string> Permitidos = new(StringComparer.Ordinal) { "Bueno", "Regular" };

    public override string Nombre => "En Reparacion";
    public override bool PuedePrestarse => false;
    protected override IReadOnlySet<string> TransicionesPermitidas => Permitidos;
}
