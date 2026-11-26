using Biblioteca.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Biblioteca.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CatalogoService>();
        services.AddScoped<LectorService>();
        services.AddScoped<AuthService>();
        services.AddScoped<PrestamoService>();
        return services;
    }
}
