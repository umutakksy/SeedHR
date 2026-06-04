using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    public class LoginModel : PageModel
    {
        private readonly ApiService _apiService;

        public LoginModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        [BindProperty]
        public string Email { get; set; } = null!;

        [BindProperty]
        public string Password { get; set; } = null!;

        public string? ErrorMessage { get; set; }

        public IActionResult OnGet()
        {
            if (User?.Identity?.IsAuthenticated == true)
            {
                return RedirectToPage("/Index");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                ErrorMessage = "Lütfen tüm alanları doldurun.";
                return Page();
            }

            string turnstileToken = Request.Form["cf-turnstile-response"]!;
            if (string.IsNullOrEmpty(turnstileToken))
            {
                ErrorMessage = "Güvenlik doğrulaması (CAPTCHA) zorunludur.";
                return Page();
            }

            var loginRequest = new LoginRequest
            {
                Email = Email,
                Password = Password,
                TurnstileToken = turnstileToken
            };

            var response = await _apiService.LoginAsync(loginRequest);

            if (response.Success && response.Data != null)
            {
                var loginResponse = response.Data;
                var user = loginResponse.User;

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.RoleName),
                    new Claim("Token", loginResponse.Token),
                    new Claim("Department", user.DepartmentName ?? ""),
                    new Claim("Position", user.PositionTitle ?? ""),
                    new Claim("UserId", user.Id)
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = loginResponse.ExpiresAt
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                return RedirectToPage("/Index");
            }
            else
            {
                ErrorMessage = response.Message ?? "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
                return Page();
            }
        }
    }
}
