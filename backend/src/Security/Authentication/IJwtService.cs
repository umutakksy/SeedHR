namespace SeedHR.Backend.Security.Authentication;

using SeedHR.Backend.Models.Entities;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
