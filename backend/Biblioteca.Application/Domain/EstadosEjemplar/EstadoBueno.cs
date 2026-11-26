namespace Biblioteca.Application.Domain.EstadosEjemplar;

public sealed class EstadoBueno : EstadoEjemplarBase
{
    private static readonly HashSet<string> Permitidos = new(StringComparer.Ordinal) { "Regular", "Dañado" };

    public override string Nombre => "Bueno";
    public override bool PuedePrestarse => true;
    protected override IReadOnlySet<string> TransicionesPermitidas => Permitidos;
}
