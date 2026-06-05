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
    public class PerformanceModel : PageModel
    {
        private readonly ApiService _apiService;

        public PerformanceModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<UserDto> Employees { get; set; } = new();
        public List<PerformanceGoalDto> Goals { get; set; } = new();
        public List<PerformanceEvaluationDto> Evaluations { get; set; } = new();

        [BindProperty(SupportsGet = true)]
        public string? TargetUserId { get; set; }

        [BindProperty]
        public CreatePerformanceGoalRequest NewGoal { get; set; } = new();

        [BindProperty]
        public CreatePerformanceEvaluationRequest NewEvaluation { get; set; } = new();

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
            var currentUserId = User.FindFirst("UserId")?.Value ?? "";

            // 1. If manager/HR/Admin, fetch employees list for select dropdown
            if (role == "Admin" || role == "HR")
            {
                var empRes = await _apiService.GetUsersAsync();
                if (empRes.Success && empRes.Data != null) Employees = empRes.Data.ToList();
            }

            // 2. Determine target user to load performance items for
            string userId = currentUserId;
            if ((role == "Admin" || role == "HR") && !string.IsNullOrEmpty(TargetUserId))
            {
                userId = TargetUserId;
            }
            else
            {
                TargetUserId = currentUserId;
            }

            // 3. Fetch goals
            if (!string.IsNullOrEmpty(userId))
            {
                var goalsRes = await _apiService.GetPerformanceGoalsAsync(userId);
                if (goalsRes.Success && goalsRes.Data != null) Goals = goalsRes.Data.ToList();

                var evalRes = await _apiService.GetPerformanceEvaluationsAsync(userId);
                if (evalRes.Success && evalRes.Data != null) Evaluations = evalRes.Data.ToList();
            }
        }

        public async Task<IActionResult> OnPostCreateGoalAsync()
        {
            if (string.IsNullOrEmpty(TargetUserId))
            {
                ErrorMessage = "Hedef çalışan seçilmedi.";
                await LoadDataAsync();
                return Page();
            }

            if (string.IsNullOrEmpty(NewGoal.Title) || string.IsNullOrEmpty(NewGoal.Description) || NewGoal.StartDate == DateTime.MinValue || NewGoal.DueDate == DateTime.MinValue)
            {
                ErrorMessage = "Lütfen tüm hedef alanlarını doldurun.";
                await LoadDataAsync();
                return Page();
            }

            if (NewGoal.StartDate.Date >= NewGoal.DueDate.Date)
            {
                ErrorMessage = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CreatePerformanceGoalAsync(TargetUserId, NewGoal);
            if (res.Success)
                SuccessMessage = "Yeni performans hedefi tanımlandı.";
            else
                ErrorMessage = res.Message ?? "Hedef tanımlanırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostUpdateGoalStatusAsync(string id, string status)
        {
            var res = await _apiService.UpdatePerformanceGoalStatusAsync(id, status);
            if (res.Success)
                SuccessMessage = "Hedef durumu başarıyla güncellendi.";
            else
                ErrorMessage = res.Message ?? "Hedef durumu güncellenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostCreateEvaluationAsync()
        {
            if (string.IsNullOrEmpty(NewEvaluation.UserId))
            {
                ErrorMessage = "Değerlendirilecek çalışan seçilmedi.";
                await LoadDataAsync();
                return Page();
            }

            if (NewEvaluation.Rating < 1 || NewEvaluation.Rating > 5 || string.IsNullOrEmpty(NewEvaluation.Period))
            {
                ErrorMessage = "Puan 1-5 arasında olmalı ve dönem seçilmelidir.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CreatePerformanceEvaluationAsync(NewEvaluation);
            if (res.Success)
            {
                SuccessMessage = "Performans değerlendirme formu başarıyla kaydedildi.";
                TargetUserId = NewEvaluation.UserId; // Redirect to evaluated user view
            }
            else
            {
                ErrorMessage = res.Message ?? "Değerlendirme eklenirken hata oluştu.";
            }

            await LoadDataAsync();
            return Page();
        }
    }
}
