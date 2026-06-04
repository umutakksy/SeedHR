using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    [Authorize]
    public class AnnouncementsModel : PageModel
    {
        private readonly ApiService _apiService;

        public AnnouncementsModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<AnnouncementDto> Announcements { get; set; } = new();

        [BindProperty]
        public CreateAnnouncementRequest NewAnnouncement { get; set; } = new();

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await LoadDataAsync();
            return Page();
        }

        private async Task LoadDataAsync()
        {
            var res = await _apiService.GetAnnouncementsAsync();
            if (res.Success && res.Data != null)
            {
                Announcements = res.Data.ToList();
            }
        }

        public async Task<IActionResult> OnPostCreateAsync()
        {
            if (string.IsNullOrEmpty(NewAnnouncement.Title) || string.IsNullOrEmpty(NewAnnouncement.Content))
            {
                ErrorMessage = "Duyuru başlığı ve içeriği zorunludur.";
                await LoadDataAsync();
                return Page();
            }

            // Set default category if empty
            if (string.IsNullOrEmpty(NewAnnouncement.Category))
            {
                NewAnnouncement.Category = "Genel";
            }

            var res = await _apiService.CreateAnnouncementAsync(NewAnnouncement);
            if (res.Success)
                SuccessMessage = "Duyuru başarıyla yayınlandı.";
            else
                ErrorMessage = res.Message ?? "Duyuru yayınlanırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(string id)
        {
            var res = await _apiService.DeleteAnnouncementAsync(id);
            if (res.Success)
                SuccessMessage = "Duyuru başarıyla kaldırıldı.";
            else
                ErrorMessage = res.Message ?? "Duyuru kaldırılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }
    }
}
