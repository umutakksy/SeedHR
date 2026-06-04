using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    // NO [Authorize] attribute since this is public job board
    public class BasvuruModel : PageModel
    {
        private readonly ApiService _apiService;

        public BasvuruModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<JobPostingDto> OpenPostings { get; set; } = new();

        [BindProperty]
        public CreateCandidateRequest Candidate { get; set; } = new();

        [BindProperty]
        public string SelectedJobPostingId { get; set; } = null!;

        [BindProperty]
        public IFormFile CVFile { get; set; } = null!;

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await LoadOpenPostingsAsync();
            return Page();
        }

        private async Task LoadOpenPostingsAsync()
        {
            var res = await _apiService.GetOpenJobPostingsAsync();
            if (res.Success && res.Data != null)
            {
                OpenPostings = res.Data.ToList();
            }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (string.IsNullOrEmpty(SelectedJobPostingId))
            {
                ErrorMessage = "Lütfen başvurmak istediğiniz iş ilanını seçin.";
                await LoadOpenPostingsAsync();
                return Page();
            }

            if (string.IsNullOrEmpty(Candidate.FirstName) || string.IsNullOrEmpty(Candidate.LastName) || string.IsNullOrEmpty(Candidate.Email) || string.IsNullOrEmpty(Candidate.Phone))
            {
                ErrorMessage = "Ad, Soyad, E-posta ve Telefon alanları zorunludur.";
                await LoadOpenPostingsAsync();
                return Page();
            }

            if (CVFile == null || CVFile.Length == 0)
            {
                ErrorMessage = "Lütfen özgeçmiş (CV) dosyanızı seçin.";
                await LoadOpenPostingsAsync();
                return Page();
            }

            string turnstileToken = Request.Form["cf-turnstile-response"]!;
            if (string.IsNullOrEmpty(turnstileToken))
            {
                ErrorMessage = "Güvenlik doğrulaması (CAPTCHA) zorunludur.";
                await LoadOpenPostingsAsync();
                return Page();
            }

            using var stream = CVFile.OpenReadStream();
            var res = await _apiService.ApplyToJobPostingAsync(SelectedJobPostingId, Candidate, CVFile.FileName, stream, turnstileToken);

            if (res.Success)
            {
                SuccessMessage = "Başvurunuz başarıyla alınmıştır. İnceleme sürecinden sonra sizinle iletişime geçilecektir.";
                // Clear candidate form
                Candidate = new();
            }
            else
            {
                ErrorMessage = res.Message ?? "Başvuru sırasında hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
            }

            await LoadOpenPostingsAsync();
            return Page();
        }
    }
}
