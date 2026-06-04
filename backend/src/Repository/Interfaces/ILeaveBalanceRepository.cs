namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface ILeaveBalanceRepository : IRepository<LeaveBalance>
{
    Task<LeaveBalance?> GetByUserAndTypeAsync(string userId, string leaveTypeId);
    Task<IEnumerable<LeaveBalance>> GetByUserAsync(string userId);
    Task<IEnumerable<LeaveBalance>> GetByLeaveTypeAsync(string leaveTypeId);
    Task<IEnumerable<LeaveBalance>> GetByYearAsync(int year);
}
