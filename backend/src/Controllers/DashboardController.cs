namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardStatisticsDto>>> GetStats()
    {
        var stats = await _dashboardService.GetDashboardStatisticsAsync();
        return Ok(ApiResponse<DashboardStatisticsDto>.SuccessResponse(stats, "Dashboard statistics retrieved successfully"));
    }
}
