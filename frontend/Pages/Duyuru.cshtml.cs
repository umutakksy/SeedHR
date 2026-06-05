using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    public class DuyuruModel : PageModel
    {
        private readonly ApiService _apiService;

        public DuyuruModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<AnnouncementDto> Announcements { get; set; } = new();
        public List<string> GununMenusu { get; set; } = new();
        public string BugununTarihi { get; set; } = string.Empty;
        public string HavaDurumu { get; set; } = string.Empty;
        public string HavaDerece { get; set; } = string.Empty;
        public string HavaIcon { get; set; } = string.Empty;

        public async Task OnGetAsync()
        {
            // 1. Fetch public announcements
            var response = await _apiService.GetPublicAnnouncementsAsync();
            if (response != null && response.Success && response.Data != null)
            {
                var allAnnouncements = response.Data.ToList();
                
                // Find latest Menu of the Day announcement
                var menuAnnouncement = allAnnouncements
                    .Where(a => a.Category == "YemekMenusu")
                    .OrderByDescending(a => a.PublishedDate)
                    .FirstOrDefault();

                if (menuAnnouncement != null)
                {
                    // Split the content by newlines or commas
                    GununMenusu = menuAnnouncement.Content
                        .Split(new[] { '\n', '\r', ',' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(item => item.Trim())
                        .Where(item => !string.IsNullOrEmpty(item))
                        .ToList();
                }
                else
                {
                    // Fallback to day of week menu
                    GenerateMenu(DateTime.UtcNow.AddHours(3).DayOfWeek);
                }

                // Filter out the YemekMenusu from the main announcements stream
                Announcements = allAnnouncements
                    .Where(a => a.Category != "YemekMenusu")
                    .OrderByDescending(a => a.PublishedDate)
                    .ToList();
            }
            else
            {
                // Fallback menu
                GenerateMenu(DateTime.UtcNow.AddHours(3).DayOfWeek);
            }

            // 2. Format today's date in Turkish
            var turkishCulture = new System.Globalization.CultureInfo("tr-TR");
            BugununTarihi = DateTime.UtcNow.AddHours(3).ToString("dd MMMM yyyy, dddd", turkishCulture);

            // 3. Generate dynamic mock weather info
            GenerateWeather();
        }

        private void GenerateMenu(DayOfWeek day)
        {
            switch (day)
            {
                case DayOfWeek.Monday:
                    GununMenusu = new List<string> { "Ezogelin Çorbası", "Hünkar Beğendi", "Pirinç Pilavı", "Mevsim Salatası", "Kemalpaşa Tatlısı" };
                    break;
                case DayOfWeek.Tuesday:
                    GununMenusu = new List<string> { "Süzme Mercimek Çorbası", "Fırında Tavuk Baget", "Bulgur Pilavı", "Cacık", "Meyve Tabağı" };
                    break;
                case DayOfWeek.Wednesday:
                    GununMenusu = new List<string> { "Yayla Çorbası", "Kuru Fasulye", "Pirinç Pilavı", "Turşu", "Revani" };
                    break;
                case DayOfWeek.Thursday:
                    GununMenusu = new List<string> { "Tarhana Çorbası", "İzmir Köfte", "Cevizli Erişte", "Çoban Salatası", "Sütlaç" };
                    break;
                case DayOfWeek.Friday:
                    GununMenusu = new List<string> { "Domates Çorbası", "Piliç Stroganoff", "Fırın Makarna", "Yeşil Salata", "Puding" };
                    break;
                default:
                    GununMenusu = new List<string> { "Hafta Sonu Menüsü", "Şefin Özel Tabağı", "Patates Kızartması", "Mevsim Salatası", "Dondurma" };
                    break;
            }
        }

        private void GenerateWeather()
        {
            var month = DateTime.UtcNow.AddHours(3).Month;

            // Simple seasonal mock
            if (month >= 6 && month <= 8) // Summer
            {
                HavaDurumu = "Güneşli ve Açık";
                HavaDerece = "28°C";
                HavaIcon = "fa-sun text-amber-500 animate-bounce";
            }
            else if (month >= 9 && month <= 11) // Autumn
            {
                HavaDurumu = "Parçalı Bulutlu";
                HavaDerece = "18°C";
                HavaIcon = "fa-cloud-sun text-blue-400";
            }
            else if (month >= 12 || month <= 2) // Winter
            {
                HavaDurumu = "Soğuk ve Yağmurlu";
                HavaDerece = "8°C";
                HavaIcon = "fa-cloud-showers-heavy text-slate-500";
            }
            else // Spring
            {
                HavaDurumu = "Ilık ve Güneşli";
                HavaDerece = "21°C";
                HavaIcon = "fa-cloud-sun text-yellow-400";
            }
        }
    }
}
