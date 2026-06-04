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
    public class LeavesModel : PageModel
    {
        private readonly ApiService _apiService;

        public LeavesModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<LeaveRequestDto> LeaveRequests { get; set; } = new();
        public List<LeaveBalanceDto> LeaveBalances { get; set; } = new();
        public List<LeaveTypeDto> LeaveTypes { get; set; } = new();

        [BindProperty]
        public CreateLeaveRequestRequest NewLeave { get; set; } = new();

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
            var userId = User.FindFirst("UserId")?.Value ?? "";

            // 1. Fetch leave requests based on role
            if (role == "Admin" || role == "HR")
            {
                var reqRes = await _apiService.GetLeaveRequestsAsync();
                if (reqRes.Success && reqRes.Data != null) LeaveRequests = reqRes.Data.ToList();
            }
            else
            {
                var reqRes = await _apiService.GetMyLeaveRequestsAsync();
                if (reqRes.Success && reqRes.Data != null) LeaveRequests = reqRes.Data.ToList();
            }

            // 2. Fetch leave balances for current user
            if (!string.IsNullOrEmpty(userId))
            {
                var balRes = await _apiService.GetLeaveBalancesAsync(userId);
                if (balRes.Success && balRes.Data != null) LeaveBalances = balRes.Data.ToList();
            }

            // 3. Fetch leave types
            var typeRes = await _apiService.GetLeaveTypesAsync();
            if (typeRes.Success && typeRes.Data != null) LeaveTypes = typeRes.Data.ToList();
        }

        public async Task<IActionResult> OnPostCreateAsync()
        {
            if (string.IsNullOrEmpty(NewLeave.LeaveTypeId) || NewLeave.StartDate == DateTime.MinValue || NewLeave.EndDate == DateTime.MinValue)
            {
                ErrorMessage = "Lütfen tüm zorunlu alanları doldurun.";
                await LoadDataAsync();
                return Page();
            }

            if (NewLeave.StartDate > NewLeave.EndDate)
            {
                ErrorMessage = "Başlangıç tarihi bitiş tarihinden sonra olamaz.";
                await LoadDataAsync();
                return Page();
            }

            // Auto-calculate days requested (business days inclusive)
            NewLeave.DaysRequested = (int)(NewLeave.EndDate - NewLeave.StartDate).TotalDays + 1;

            var res = await _apiService.CreateLeaveRequestAsync(NewLeave);
            if (res.Success)
                SuccessMessage = "İzin talebi başarıyla oluşturuldu.";
            else
                ErrorMessage = res.Message ?? "İzin talebi gönderilirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostApproveAsync(string id)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";
            if (role != "Admin" && role != "HR")
            {
                ErrorMessage = "Bu işlem için yetkiniz bulunmuyor.";
                await LoadDataAsync();
                return Page();
            }

            var approval = new LeaveApprovalRequest
            {
                Status = "Approved"
            };

            var res = await _apiService.ApproveLeaveRequestAsync(id, approval);
            if (res.Success)
                SuccessMessage = "İzin talebi onaylandı.";
            else
                ErrorMessage = res.Message ?? "İzin onaylanırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostRejectAsync(string id, string? rejectionReason)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";
            if (role != "Admin" && role != "HR")
            {
                ErrorMessage = "Bu işlem için yetkiniz bulunmuyor.";
                await LoadDataAsync();
                return Page();
            }

            var approval = new LeaveApprovalRequest
            {
                Status = "Rejected",
                RejectionReason = rejectionReason ?? "Gerekçe belirtilmedi."
            };

            var res = await _apiService.ApproveLeaveRequestAsync(id, approval);
            if (res.Success)
                SuccessMessage = "İzin talebi reddedildi.";
            else
                ErrorMessage = res.Message ?? "İzin reddedilirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }
    }
}
