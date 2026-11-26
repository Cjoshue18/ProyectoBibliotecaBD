using Biblioteca.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Biblioteca.Api.Filters;

public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, title) = context.Exception switch
        {
            ReglaNegocioException => (StatusCodes.Status400BadRequest, "Regla de negocio"),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "No autorizado"),
            NotFoundException => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflicto de datos"),
            _ => (0, "")
        };

        if (status == 0) return;

        context.Result = new ObjectResult(new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = context.Exception.Message
        })
        { StatusCode = status };

        context.ExceptionHandled = true;
    }
}
