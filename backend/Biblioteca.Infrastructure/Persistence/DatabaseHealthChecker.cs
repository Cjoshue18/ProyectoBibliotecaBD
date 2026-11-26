using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Infrastructure.Persistence;

public class DatabaseHealthChecker
{
    private readonly BibliotecaDbContext _context;

    public DatabaseHealthChecker(BibliotecaDbContext context)
    {
        _context = context;
    }

    public async Task<(bool CanConnect, int FacultadesCount)> CheckAsync(CancellationToken cancellationToken = default)
    {
        var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
            return (false, 0);

        var facultadesCount = await _context.Facultades.CountAsync(cancellationToken);
        return (true, facultadesCount);
    }
}
