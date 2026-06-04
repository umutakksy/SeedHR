namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.DTOs.Auth;

public interface IAuthenticationService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<UserDto> RegisterAsync(CreateUserRequest request);
    Task<bool> ValidateTokenAsync(string token);
    Task LogoutAsync(string userId);
    Task<LoginResponse> RefreshTokenAsync(string refreshToken);
}
