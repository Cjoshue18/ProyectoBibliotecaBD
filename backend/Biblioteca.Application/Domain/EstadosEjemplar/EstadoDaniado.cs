namespace Biblioteca.Application.Domain.EstadosEjemplar;

public sealed class EstadoDaniado : EstadoEjemplarBase
{
    private static readonly HashSet<string> Permitidos = new(StringComparer.Ordinal) { "En Reparacion" };

    public override string Nombre => "Dañado";
    public override bool PuedePrestarse => false;
    protected override IReadOnlySet<string> TransicionesPermitidas => Permitidos;
}
