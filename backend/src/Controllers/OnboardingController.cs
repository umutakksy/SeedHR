using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;

    public OnboardingController(IOnboardingService onboardingService)
    {
        _onboardingService = onboardingService;
    }

    [HttpGet("plans")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<OnboardingPlanDto>>>> GetPlans()
    {
        var plans = await _onboardingService.GetPlansAsync();
        return Ok(ApiResponse<IEnumerable<OnboardingPlanDto>>.SuccessResponse(plans, "Onboarding plans retrieved successfully"));
    }

    [HttpGet("plans/{id}")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<OnboardingPlanDto>>> GetPlanById(string id)
    {
        var plan = await _onboardingService.GetPlanByIdAsync(id);
        return Ok(ApiResponse<OnboardingPlanDto>.SuccessResponse(plan, "Onboarding plan retrieved successfully"));
    }

    [HttpPost("plans")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<OnboardingPlanDto>>> CreatePlan([FromBody] CreateOnboardingPlanRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<OnboardingPlanDto>.ErrorResponse("Invalid input"));

        var plan = await _onboardingService.CreatePlanAsync(request);
        return Created("", ApiResponse<OnboardingPlanDto>.SuccessResponse(plan, "Onboarding plan created successfully"));
    }

    [HttpPost("start")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<OnboardingProgressDto>>> StartOnboarding([FromQuery] string userId, [FromQuery] string planId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(planId))
        {
            return BadRequest(ApiResponse<OnboardingProgressDto>.ErrorResponse("User ID and Plan ID are required"));
        }

        var progress = await _onboardingService.StartOnboardingAsync(userId, planId);
        return Ok(ApiResponse<OnboardingProgressDto>.SuccessResponse(progress, "Onboarding process started successfully"));
    }

    [HttpGet("progress/user/{userId}")]
    public async Task<ActionResult<ApiResponse<OnboardingProgressDto>>> GetProgress(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && role != "Manager" && currentUserId != userId)
        {
            return Forbid();
        }

        var progress = await _onboardingService.GetProgressAsync(userId);
        return Ok(ApiResponse<OnboardingProgressDto>.SuccessResponse(progress, "Onboarding progress retrieved successfully"));
    }

    [HttpPost("task/{taskId}/complete")]
    public async Task<ActionResult<ApiResponse<OnboardingProgressDto>>> CompleteTask(string taskId, [FromBody] CompleteTaskRequest request)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<OnboardingProgressDto>.ErrorResponse("User ID is required"));

        var progress = await _onboardingService.CompleteTaskAsync(userId, taskId, request);
        return Ok(ApiResponse<OnboardingProgressDto>.SuccessResponse(progress, "Onboarding task completed successfully"));
    }

    [HttpGet("active")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<OnboardingProgressDto>>>> GetActiveOnboardings()
    {
        var activeOnboardings = await _onboardingService.GetActiveOnboardingsAsync();
        return Ok(ApiResponse<IEnumerable<OnboardingProgressDto>>.SuccessResponse(activeOnboardings, "Active onboarding processes retrieved successfully"));
    }

    [HttpPost("send-reminders")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<bool>>> SendReminders()
    {
        await _onboardingService.SendRemindersAsync();
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Onboarding overdue reminders sent successfully"));
    }
}
