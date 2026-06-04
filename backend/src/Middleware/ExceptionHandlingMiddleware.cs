namespace SeedHR.Backend.Middleware;

using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using Serilog;
using System.Net;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse<object>();

        switch (exception)
        {
            case NotFoundException notFound:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = ApiResponse<object>.ErrorResponse(notFound.Message);
                break;

            case UnauthorizedException unauthorized:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = ApiResponse<object>.ErrorResponse(unauthorized.Message);
                break;

            case ValidationException validation:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = ApiResponse<object>.ErrorResponse(validation.Message);
                break;

            case ConflictException conflict:
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                response = ApiResponse<object>.ErrorResponse(conflict.Message);
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
                response = ApiResponse<object>.ErrorResponse(
                    isDevelopment ? exception.Message : "An internal error occurred. Please try again later."
                );
                break;
        }

        return context.Response.WriteAsJsonAsync(response);
    }
}
