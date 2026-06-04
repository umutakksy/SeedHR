namespace SeedHR.Backend.Models.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public UserDto User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}
