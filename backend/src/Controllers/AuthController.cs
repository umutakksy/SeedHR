namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.DTOs.Auth;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _turnstileSecretKey;

    public AuthController(IAuthenticationService authService, IHttpClientFactory httpClientFactory)
    {
        _authService = authService;
        _httpClientFactory = httpClientFactory;
        _turnstileSecretKey = Environment.GetEnvironmentVariable("TURNSTILE_SECRET_KEY") ?? "";
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<LoginResponse>.ErrorResponse("Invalid input"));

        // Verify Turnstile Captcha
        if (string.IsNullOrEmpty(request.TurnstileToken))
        {
            return BadRequest(ApiResponse<LoginResponse>.ErrorResponse("CAPTCHA doğrulaması zorunludur."));
        }

        var turnstileSuccess = await VerifyTurnstileTokenAsync(request.TurnstileToken);
        if (!turnstileSuccess)
        {
            return BadRequest(ApiResponse<LoginResponse>.ErrorResponse("CAPTCHA doğrulaması başarısız oldu. Lütfen tekrar deneyin."));
        }

        var result = await _authService.LoginAsync(request);
        return Ok(ApiResponse<LoginResponse>.SuccessResponse(result, "Login successful"));
    }

    private async Task<bool> VerifyTurnstileTokenAsync(string token)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var values = new Dictionary<string, string>
            {
                { "secret", _turnstileSecretKey },
                { "response", token }
            };

            var content = new FormUrlEncodedContent(values);
            var response = await client.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);

            if (!response.IsSuccessStatusCode) return false;

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(jsonString);
            if (doc.RootElement.TryGetProperty("success", out var successProp))
            {
                return successProp.GetBoolean();
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<UserDto>>> Register([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<UserDto>.ErrorResponse("Invalid input"));

        var result = await _authService.RegisterAsync(request);
        return Created("", ApiResponse<UserDto>.SuccessResponse(result, "Registration successful"));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(ApiResponse<LoginResponse>.SuccessResponse(result, "Token refreshed"));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> Logout()
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        await _authService.LogoutAsync(userId);
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Logout successful"));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        // TODO: Implement in UserService
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Password changed"));
    }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = null!;
}
