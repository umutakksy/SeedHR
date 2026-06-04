using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    [Authorize]
    public class IndexModel : PageModel
    {
        private readonly ApiService _apiService;

        public IndexModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public DashboardStatisticsDto Stats { get; set; } = new();
        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            var response = await _apiService.GetDashboardStatisticsAsync();
            if (response.Success && response.Data != null)
            {
                Stats = response.Data;
            }
            else
            {
                ErrorMessage = "Gösterge paneli istatistikleri yüklenirken hata oluştu.";
            }

            return Page();
        }

        // Quick punch check-in / check-out handler
        public async Task<IActionResult> OnPostCheckInAsync()
        {
            var res = await _apiService.CheckInAsync();
            if (res.Success)
                SuccessMessage = "Giriş işlemi başarıyla gerçekleştirildi.";
            else
                ErrorMessage = res.Message ?? "Giriş yapılamadı.";

            // Refresh stats
            var statsRes = await _apiService.GetDashboardStatisticsAsync();
            if (statsRes.Success && statsRes.Data != null) Stats = statsRes.Data;

            return Page();
        }

        public async Task<IActionResult> OnPostCheckOutAsync()
        {
            var res = await _apiService.CheckOutAsync();
            if (res.Success)
                SuccessMessage = "Çıkış işlemi başarıyla gerçekleştirildi.";
            else
                ErrorMessage = res.Message ?? "Çıkış yapılamadı.";

            // Refresh stats
            var statsRes = await _apiService.GetDashboardStatisticsAsync();
            if (statsRes.Success && statsRes.Data != null) Stats = statsRes.Data;

            return Page();
        }
    }
}
