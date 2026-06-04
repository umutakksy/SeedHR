namespace SeedHR.Backend.Middleware;

using Serilog;
using Serilog.Context;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;
        var userId = context.User?.FindFirst("sub")?.Value ?? "Anonymous";
        var requestPath = context.Request.Path;

        using (LogContext.PushProperty("UserId", userId))
        using (LogContext.PushProperty("RequestPath", requestPath))
        {
            Log.Information(
                "HTTP {Method} {Path} started by {UserId}",
                context.Request.Method,
                requestPath,
                userId
            );

            await _next(context);

            var duration = DateTime.UtcNow - startTime;
            Log.Information(
                "HTTP {Method} {Path} completed with status {StatusCode} in {Duration}ms",
                context.Request.Method,
                requestPath,
                context.Response.StatusCode,
                duration.TotalMilliseconds
            );
        }
    }
}
