namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface ILeaveRequestRepository : IRepository<LeaveRequest>
{
    Task<IEnumerable<LeaveRequest>> GetByUserAsync(string userId);
    Task<IEnumerable<LeaveRequest>> GetPendingAsync();
    Task<IEnumerable<LeaveRequest>> GetByStatusAsync(string status);
    Task<IEnumerable<LeaveRequest>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<LeaveRequest>> GetOverlappingAsync(string userId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<LeaveRequest>> GetUpcomingLeavesAsync(int days = 30);
}
