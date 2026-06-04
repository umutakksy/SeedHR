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
    [Authorize(Roles = "Admin,HR")]
    public class SettingsModel : PageModel
    {
        private readonly ApiService _apiService;

        public SettingsModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<DepartmentDto> Departments { get; set; } = new();
        public List<PositionDto> Positions { get; set; } = new();
        public List<UserDto> Employees { get; set; } = new();

        [BindProperty]
        public CreateDepartmentRequest NewDept { get; set; } = new();

        [BindProperty]
        public UpdateDepartmentRequest EditDept { get; set; } = new();

        [BindProperty]
        public string? EditDeptId { get; set; }

        [BindProperty]
        public CreatePositionRequest NewPos { get; set; } = new();

        [BindProperty]
        public UpdatePositionRequest EditPos { get; set; } = new();

        [BindProperty]
        public string? EditPosId { get; set; }

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await LoadDataAsync();
            return Page();
        }

        private async Task LoadDataAsync()
        {
            var deptRes = await _apiService.GetDepartmentsAsync();
            if (deptRes.Success && deptRes.Data != null) Departments = deptRes.Data.ToList();

            var posRes = await _apiService.GetPositionsAsync();
            if (posRes.Success && posRes.Data != null) Positions = posRes.Data.ToList();

            var empRes = await _apiService.GetUsersAsync();
            if (empRes.Success && empRes.Data != null) Employees = empRes.Data.ToList();
        }

        // Departments CRUD
        public async Task<IActionResult> OnPostCreateDepartmentAsync()
        {
            if (string.IsNullOrEmpty(NewDept.Name) || string.IsNullOrEmpty(NewDept.Code))
            {
                ErrorMessage = "Departman adı ve kodu zorunludur.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CreateDepartmentAsync(NewDept);
            if (res.Success)
                SuccessMessage = "Departman başarıyla oluşturuldu.";
            else
                ErrorMessage = res.Message ?? "Departman oluşturulurken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostUpdateDepartmentAsync()
        {
            if (string.IsNullOrEmpty(EditDeptId) || string.IsNullOrEmpty(EditDept.Name) || string.IsNullOrEmpty(EditDept.Code))
            {
                ErrorMessage = "Güncellenecek geçerli departman bilgisi bulunamadı.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.UpdateDepartmentAsync(EditDeptId, EditDept);
            if (res.Success)
                SuccessMessage = "Departman bilgileri güncellendi.";
            else
                ErrorMessage = res.Message ?? "Departman güncellenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteDepartmentAsync(string id)
        {
            var res = await _apiService.DeleteDepartmentAsync(id);
            if (res.Success)
                SuccessMessage = "Departman başarıyla kaldırıldı.";
            else
                ErrorMessage = res.Message ?? "Departman kaldırılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        // Positions CRUD
        public async Task<IActionResult> OnPostCreatePositionAsync()
        {
            if (string.IsNullOrEmpty(NewPos.Title) || string.IsNullOrEmpty(NewPos.Code) || string.IsNullOrEmpty(NewPos.DepartmentId))
            {
                ErrorMessage = "Pozisyon unvanı, kodu ve departman seçimi zorunludur.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CreatePositionAsync(NewPos);
            if (res.Success)
                SuccessMessage = "Yeni pozisyon unvanı eklendi.";
            else
                ErrorMessage = res.Message ?? "Pozisyon eklenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostUpdatePositionAsync()
        {
            if (string.IsNullOrEmpty(EditPosId) || string.IsNullOrEmpty(EditPos.Title) || string.IsNullOrEmpty(EditPos.Code))
            {
                ErrorMessage = "Güncellenecek geçerli pozisyon bilgisi bulunamadı.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.UpdatePositionAsync(EditPosId, EditPos);
            if (res.Success)
                SuccessMessage = "Pozisyon unvanı başarıyla güncellendi.";
            else
                ErrorMessage = res.Message ?? "Pozisyon güncellenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostDeletePositionAsync(string id)
        {
            var res = await _apiService.DeletePositionAsync(id);
            if (res.Success)
                SuccessMessage = "Pozisyon başarıyla kaldırıldı.";
            else
                ErrorMessage = res.Message ?? "Pozisyon kaldırılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }
    }
}
