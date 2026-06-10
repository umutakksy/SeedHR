namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IAttendanceService
{
    Task<AttendanceDto> CheckInAsync(string userId, string? notes = null);
    Task<AttendanceDto> CheckOutAsync(string userId);
    Task<AttendanceDto?> GetAttendanceRecordAsync(string userId, DateTime date);
    Task<IEnumerable<AttendanceDto>> GetUserAttendanceAsync(string userId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<AttendanceDto>> GetAllAttendanceAsync();
    Task<PaginatedResponse<AttendanceDto>> GetPagedAttendanceAsync(int page, int pageSize);
}
