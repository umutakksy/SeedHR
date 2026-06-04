namespace SeedHR.Backend.Security.Authentication;

using Microsoft.IdentityModel.Tokens;
using SeedHR.Backend.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtService : IJwtService
{
    private readonly string _secretKey;
    private readonly int _expirationHours;

    public JwtService(IConfiguration configuration)
    {
        _secretKey = Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret not configured");

        if (_secretKey.Length < 32)
            throw new InvalidOperationException("JWT Secret must be at least 32 characters long");

        _expirationHours = int.Parse(
            Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS")
            ?? configuration["Jwt:ExpirationHours"]
            ?? "24"
        );
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim("sub", user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
            new Claim("role", user.Role?.Name ?? "User"),
            new Claim("department", user.DepartmentId ?? ""),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString("N");
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_secretKey));
            var tokenHandler = new JwtSecurityTokenHandler();

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false
            }, out var securityToken);

            if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
