using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    [Authorize]
    public class AttendanceModel : PageModel
    {
        private readonly ApiService _apiService;

        public AttendanceModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<AttendanceDto> AttendanceRecords { get; set; } = new();
        public List<WorkScheduleDto> WorkSchedules { get; set; } = new();

        [BindProperty]
        public CreateWorkScheduleRequest NewSchedule { get; set; } = new();

        [BindProperty]
        public string? EditScheduleId { get; set; }

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await LoadDataAsync();
            return Page();
        }

        private async Task LoadDataAsync()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";

            // 1. Fetch attendance records
            if (role == "Admin" || role == "HR")
            {
                var attRes = await _apiService.GetAttendanceRecordsAsync();
                if (attRes.Success && attRes.Data != null) AttendanceRecords = attRes.Data.ToList();
            }
            else
            {
                var attRes = await _apiService.GetMyAttendanceAsync();
                if (attRes.Success && attRes.Data != null) AttendanceRecords = attRes.Data.ToList();
            }

            // 2. Fetch work schedules for current range (we fetch schedules for current month +- 1 month)
            var start = DateTime.Today.AddDays(-35);
            var end = DateTime.Today.AddDays(35);
            var schedRes = await _apiService.GetWorkSchedulesByRangeAsync(start, end);
            if (schedRes.Success && schedRes.Data != null)
            {
                WorkSchedules = schedRes.Data.ToList();
            }
        }

        public async Task<IActionResult> OnPostCreateScheduleAsync()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";
            if (role != "Admin" && role != "HR")
            {
                ErrorMessage = "Vardiya tanımlamak için yetkiniz bulunmuyor.";
                await LoadDataAsync();
                return Page();
            }

            NewSchedule.DayOfWeek = (int)NewSchedule.Date.DayOfWeek;

            var res = await _apiService.CreateWorkScheduleAsync(NewSchedule);
            if (res.Success)
                SuccessMessage = "Çalışma takvimi/vardiya kaydı başarıyla eklendi.";
            else
                ErrorMessage = res.Message ?? "Kayıt eklenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostUpdateScheduleAsync()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";
            if (role != "Admin" && role != "HR" || string.IsNullOrEmpty(EditScheduleId))
            {
                ErrorMessage = "Bu işlem için yetkiniz bulunmuyor veya geçerli bir vardiya seçilmedi.";
                await LoadDataAsync();
                return Page();
            }

            NewSchedule.DayOfWeek = (int)NewSchedule.Date.DayOfWeek;

            var res = await _apiService.UpdateWorkScheduleAsync(EditScheduleId, NewSchedule);
            if (res.Success)
                SuccessMessage = "Vardiya kaydı başarıyla güncellendi.";
            else
                ErrorMessage = res.Message ?? "Güncelleme yapılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteScheduleAsync(string id)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";
            if (role != "Admin" && role != "HR")
            {
                ErrorMessage = "Vardiya silmek için yetkiniz bulunmuyor.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.DeleteWorkScheduleAsync(id);
            if (res.Success)
                SuccessMessage = "Vardiya kaydı başarıyla silindi.";
            else
                ErrorMessage = res.Message ?? "Silme işlemi yapılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }
    }
}
