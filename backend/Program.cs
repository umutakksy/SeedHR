using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using FluentValidation;
using FluentValidation.AspNetCore;
using SeedHR.Backend.Configuration;
using SeedHR.Backend.Data;
using SeedHR.Backend.Middleware;
using SeedHR.Backend.Repository.Implementations;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Security.Authentication;
using SeedHR.Backend.Services.Implementations;
using SeedHR.Backend.Services.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
var currentDir = Directory.GetCurrentDirectory();
var envLocations = new[]
{
    Path.Combine(currentDir, ".env"),
    Path.Combine(currentDir, "backend", ".env"),
    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, ".env")
};

bool envLoaded = false;
foreach (var loc in envLocations)
{
    if (File.Exists(loc))
    {
        Env.Load(loc);
        Console.WriteLine($"[ENV] loaded from: {loc}");
        envLoaded = true;
        break;
    }
}
if (!envLoaded)
{
    Env.Load();
}
Console.WriteLine($"[ENV] TURNSTILE_SECRET_KEY length: {(Environment.GetEnvironmentVariable("TURNSTILE_SECRET_KEY") ?? "").Length}");
Console.WriteLine($"[ENV] GROQ_API_KEY length: {(Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "").Length}");

// Configure Serilog (Spring Boot Style)
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore.Hosting", Serilog.Events.LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.AspNetCore.Routing", Serilog.Events.LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console(
        outputTemplate: "  {Timestamp:yyyy-MM-dd HH:mm:ss.fff}  {Level:u5} --- [{SourceContext}] : {Message:lj}{NewLine}{Exception}",
        theme: Serilog.Sinks.SystemConsole.Themes.AnsiConsoleTheme.Code
    )
    .WriteTo.File("logs/seedhr-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Suppress default model validation error format so our custom middleware handles it
        // The default format returns errors as Dictionary which doesn't match our List<string> ApiResponse
        options.SuppressModelStateInvalidFilter = true;
    });
builder.Services.AddHttpClient(); // For AiController (Groq API calls)

// Add MongoDB configuration
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection(MongoDbSettings.SectionName));

// Add MongoDB Context
builder.Services.AddSingleton<IMongoDbContext, MongoDbContext>();

// Add Repositories & UnitOfWork
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add Security Services
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

// Add Application Services
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IRecruitmentService, RecruitmentService>();
builder.Services.AddScoped<IPerformanceService, PerformanceService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Add FluentValidation
builder.Services.AddFluentValidationClientsideAdapters();

// Add JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ??
                builder.Configuration["Jwt:Secret"];
var jwtExpiration = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS") ??
                              builder.Configuration["Jwt:ExpirationHours"] ?? "24");

if (jwtSecret == null || jwtSecret.Length < 32)
    throw new InvalidOperationException("JWT_SECRET must be set and at least 32 characters");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = "role"
    };
});

// Add Authorization
builder.Services.AddAuthorization();

// Add CORS
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?.Split(",") ??
                     new[] { "http://localhost:3000", "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});



// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        Description = "JWT Authorization header"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme { Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] { }
        }
    });
});

var app = builder.Build();

// Initialize MongoDB indexes and seed data
using (var scope = app.Services.CreateScope())
{
    Console.WriteLine("[SEED] Connecting to MongoDB...");
    try
    {
        var mongoContext = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();
        Console.WriteLine("[SEED] Creating MongoDB indexes...");
        await mongoContext.CreateIndexesAsync();
        Console.WriteLine("[SEED] Indexes created successfully.");
        
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        Console.WriteLine("[SEED] Starting DatabaseSeeder.SeedAsync...");
        await DatabaseSeeder.SeedAsync(mongoContext, passwordHasher);
        Console.WriteLine("[SEED] Database seeding completed successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[SEED ERROR] Failed to seed database: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// app.UseRateLimiter();

// Custom Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseCors("AllowedOrigins");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
