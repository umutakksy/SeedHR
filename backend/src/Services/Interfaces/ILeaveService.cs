namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface ILeaveService
{
    Task<LeaveRequestDto> CreateLeaveRequestAsync(string userId, CreateLeaveRequestRequest request);
    Task<LeaveRequestDto> GetLeaveRequestByIdAsync(string id);
    Task<IEnumerable<LeaveRequestDto>> GetUserLeaveRequestsAsync(string userId);
    Task<IEnumerable<LeaveRequestDto>> GetPendingLeaveRequestsAsync();
    Task<LeaveRequestDto> ApproveLeaveRequestAsync(string leaveRequestId, string approverId);
    Task<LeaveRequestDto> RejectLeaveRequestAsync(string leaveRequestId, string approverId, string reason);
    Task<bool> CancelLeaveRequestAsync(string leaveRequestId, string userId);

    Task<LeaveBalanceDto> GetLeaveBalanceAsync(string userId, string leaveTypeId);
    Task<IEnumerable<LeaveBalanceDto>> GetUserLeaveBalancesAsync(string userId);
    Task<IEnumerable<LeaveTypeDto>> GetLeaveTypesAsync();

    Task<IEnumerable<LeaveRequestDto>> GetUpcomingLeavesAsync(int days = 30);
    Task<IEnumerable<LeaveRequestDto>> GetAllLeaveRequestsAsync();
    Task<PaginatedResponse<LeaveRequestDto>> GetPagedLeaveRequestsAsync(int page, int pageSize);
    Task<PaginatedResponse<LeaveRequestDto>> GetPagedUserLeaveRequestsAsync(string userId, int page, int pageSize);
}
