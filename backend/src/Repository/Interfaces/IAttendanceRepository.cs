namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface IAttendanceRepository : IRepository<Attendance>
{
    Task<Attendance?> GetByUserAndDateAsync(string userId, DateTime date);
    Task<IEnumerable<Attendance>> GetByUserAsync(string userId);
    Task<IEnumerable<Attendance>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Attendance>> GetByUserDateRangeAsync(string userId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<Attendance>> GetByStatusAsync(string status);
}
