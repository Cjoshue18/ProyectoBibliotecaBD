namespace Biblioteca.Application.Domain.EstadosEjemplar;

public sealed class EstadoRegular : EstadoEjemplarBase
{
    private static readonly HashSet<string> Permitidos = new(StringComparer.Ordinal) { "Dañado" };

    public override string Nombre => "Regular";
    public override bool PuedePrestarse => true;
    protected override IReadOnlySet<string> TransicionesPermitidas => Permitidos;
}
