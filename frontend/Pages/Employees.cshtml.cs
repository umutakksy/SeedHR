using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    [Authorize]
    public class EmployeesModel : PageModel
    {
        private readonly ApiService _apiService;

        public EmployeesModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<UserDto> Employees { get; set; } = new();
        public List<DepartmentDto> Departments { get; set; } = new();
        public List<PositionDto> Positions { get; set; } = new();
        
        [BindProperty]
        public CreateUserRequest NewEmployee { get; set; } = new();

        [BindProperty]
        public UpdateUserRequest EditEmployee { get; set; } = new();

        [BindProperty]
        public string EditEmployeeId { get; set; } = null!;

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        // Selected employee detail state (passed via query parameters or loaded dynamically)
        public UserDto? SelectedEmployee { get; set; }
        public List<DocumentDto> SelectedEmployeeDocuments { get; set; } = new();

        public async Task<IActionResult> OnGetAsync(string? detailId)
        {
            await LoadDataAsync();

            if (!string.IsNullOrEmpty(detailId))
            {
                var empRes = await _apiService.GetUserByIdAsync(detailId);
                if (empRes.Success && empRes.Data != null)
                {
                    SelectedEmployee = empRes.Data;
                    
                    var docRes = await _apiService.GetUserDocumentsAsync(detailId);
                    if (docRes.Success && docRes.Data != null)
                    {
                        SelectedEmployeeDocuments = docRes.Data.ToList();
                    }
                }
            }

            return Page();
        }

        private async Task LoadDataAsync()
        {
            var empRes = await _apiService.GetUsersAsync();
            if (empRes.Success && empRes.Data != null) Employees = empRes.Data.ToList();

            var deptRes = await _apiService.GetDepartmentsAsync();
            if (deptRes.Success && deptRes.Data != null) Departments = deptRes.Data.ToList();

            var posRes = await _apiService.GetPositionsAsync();
            if (posRes.Success && posRes.Data != null) Positions = posRes.Data.ToList();
        }

        public async Task<IActionResult> OnPostCreateAsync()
        {
            // Simple validation fallback
            if (string.IsNullOrEmpty(NewEmployee.Email) || string.IsNullOrEmpty(NewEmployee.FirstName) || string.IsNullOrEmpty(NewEmployee.LastName))
            {
                ErrorMessage = "Ad, soyad ve e-posta zorunludur.";
                await LoadDataAsync();
                return Page();
            }

            // Mock or default RoleId for standard employee
            // In a real app we might fetch roles, but we'll use "Employee" role
            NewEmployee.RoleId = "665eec2cc4674f3d9942c85d"; // Dummy ID, Role will be mapped
            
            var res = await _apiService.CreateUserAsync(NewEmployee);
            if (res.Success)
                SuccessMessage = "Yeni çalışan başarıyla kaydedildi.";
            else
                ErrorMessage = res.Message ?? "Çalışan kaydedilirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostUpdateAsync()
        {
            if (string.IsNullOrEmpty(EditEmployeeId))
            {
                ErrorMessage = "Güncellenecek çalışan bulunamadı.";
                await LoadDataAsync();
                return Page();
            }

            EditEmployee.RoleId = "665eec2cc4674f3d9942c85d"; // Fallback role ID

            var res = await _apiService.UpdateUserAsync(EditEmployeeId, EditEmployee);
            if (res.Success)
                SuccessMessage = "Çalışan bilgileri başarıyla güncellendi.";
            else
                ErrorMessage = res.Message ?? "Çalışan güncellenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(string id)
        {
            var res = await _apiService.DeleteUserAsync(id);
            if (res.Success)
                SuccessMessage = "Çalışan başarıyla silindi (Pasifleştirildi).";
            else
                ErrorMessage = res.Message ?? "Çalışan silinirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        // Upload employee document
        public async Task<IActionResult> OnPostUploadDocumentAsync(string targetUserId, string documentType, IFormFile documentFile)
        {
            if (documentFile == null || documentFile.Length == 0)
            {
                ErrorMessage = "Lütfen geçerli bir dosya seçin.";
                return RedirectToPage(new { detailId = targetUserId });
            }

            using var stream = documentFile.OpenReadStream();
            var res = await _apiService.UploadDocumentAsync(targetUserId, documentType, documentFile.FileName, stream);

            if (res.Success)
                SuccessMessage = "Belge başarıyla yüklendi.";
            else
                ErrorMessage = res.Message ?? "Belge yüklenirken hata oluştu.";

            return RedirectToPage(new { detailId = targetUserId });
        }

        // Delete employee document
        public async Task<IActionResult> OnPostDeleteDocumentAsync(string documentId, string targetUserId)
        {
            var res = await _apiService.DeleteDocumentAsync(documentId);
            if (res.Success)
                SuccessMessage = "Belge başarıyla silindi.";
            else
                ErrorMessage = res.Message ?? "Belge silinirken hata oluştu.";

            return RedirectToPage(new { detailId = targetUserId });
        }

        // Secure file download proxy
        public async Task<IActionResult> OnGetDownloadDocumentAsync(string id, string fileName)
        {
            var response = await _apiService.DownloadFileAsync($"Documents/{id}/download");
            if (response.IsSuccessStatusCode)
            {
                var stream = await response.Content.ReadAsStreamAsync();
                var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
                return File(stream, contentType, fileName);
            }
            return NotFound();
        }
    }
}
