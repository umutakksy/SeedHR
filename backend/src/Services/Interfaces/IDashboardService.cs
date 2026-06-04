namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IDashboardService
{
    Task<DashboardStatisticsDto> GetDashboardStatisticsAsync();
}
