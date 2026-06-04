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
    [Authorize(Roles = "Admin")]
    public class LogsModel : PageModel
    {
        private readonly ApiService _apiService;

        public LogsModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<LogFileDto> LogFiles { get; set; } = new();
        public string? SelectedLogContent { get; set; }
        public string? SelectedLogName { get; set; }
        public string? ErrorMessage { get; set; }
        public string? SuccessMessage { get; set; }

        public async Task<IActionResult> OnGetAsync(string? viewFile, int lines = 250)
        {
            await LoadLogFilesAsync();

            if (!string.IsNullOrEmpty(viewFile))
            {
                var contentRes = await _apiService.ViewLogAsync(viewFile, lines);
                if (contentRes.Success)
                {
                    SelectedLogContent = contentRes.Data;
                    SelectedLogName = viewFile;
                }
                else
                {
                    ErrorMessage = contentRes.Message ?? "Log dosyası okunamadı.";
                }
            }

            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                ErrorMessage = "Geçersiz dosya adı.";
                await LoadLogFilesAsync();
                return Page();
            }

            var deleteRes = await _apiService.DeleteLogFileAsync(fileName);
            if (deleteRes.Success)
            {
                SuccessMessage = $"{fileName} günlük dosyası başarıyla silindi.";
            }
            else
            {
                ErrorMessage = deleteRes.Message ?? "Dosya silinirken bir hata oluştu.";
            }

            await LoadLogFilesAsync();
            return Page();
        }

        private async Task LoadLogFilesAsync()
        {
            var filesRes = await _apiService.GetLogFilesAsync();
            if (filesRes.Success && filesRes.Data != null)
            {
                LogFiles = filesRes.Data.ToList();
            }
            else
            {
                ErrorMessage = filesRes.Message ?? "Günlük dosyaları listelenemedi.";
            }
        }
    }
}
