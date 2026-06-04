namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerformanceController : ControllerBase
{
    private readonly IPerformanceService _performanceService;

    public PerformanceController(IPerformanceService performanceService)
    {
        _performanceService = performanceService;
    }

    [HttpPost("goals")]
    [Authorize(Roles = "Admin,Manager,HR")]
    public async Task<ActionResult<ApiResponse<PerformanceGoalDto>>> CreateGoal([FromQuery] string userId, [FromBody] CreatePerformanceGoalRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PerformanceGoalDto>.ErrorResponse("Invalid input"));

        var goal = await _performanceService.CreateGoalAsync(userId, request);
        return Created("", ApiResponse<PerformanceGoalDto>.SuccessResponse(goal, "Performance goal created successfully"));
    }

    [HttpGet("goals/{id}")]
    public async Task<ActionResult<ApiResponse<PerformanceGoalDto>>> GetGoal(string id)
    {
        var goal = await _performanceService.GetGoalByIdAsync(id);
        if (goal == null)
            return NotFound(ApiResponse<PerformanceGoalDto>.ErrorResponse("Performance goal not found"));

        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "Manager" && role != "HR" && currentUserId != goal.UserId)
        {
            return Forbid();
        }

        return Ok(ApiResponse<PerformanceGoalDto>.SuccessResponse(goal, "Performance goal retrieved successfully"));
    }

    [HttpGet("goals/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PerformanceGoalDto>>>> GetUserGoals(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "Manager" && role != "HR" && currentUserId != userId)
        {
            return Forbid();
        }

        var goals = await _performanceService.GetUserGoalsAsync(userId);
        return Ok(ApiResponse<IEnumerable<PerformanceGoalDto>>.SuccessResponse(goals, "User goals retrieved successfully"));
    }

    [HttpPut("goals/{id}/progress")]
    public async Task<ActionResult<ApiResponse<PerformanceGoalDto>>> UpdateGoalProgress(string id, [FromQuery] int progress)
    {
        var goal = await _performanceService.GetGoalByIdAsync(id);
        if (goal == null)
            return NotFound(ApiResponse<PerformanceGoalDto>.ErrorResponse("Performance goal not found"));

        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "Manager" && role != "HR" && currentUserId != goal.UserId)
        {
            return Forbid();
        }

        var updated = await _performanceService.UpdateGoalProgressAsync(id, progress);
        return Ok(ApiResponse<PerformanceGoalDto>.SuccessResponse(updated, "Goal progress updated successfully"));
    }

    [HttpDelete("goals/{id}")]
    [Authorize(Roles = "Admin,Manager,HR")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteGoal(string id)
    {
        var result = await _performanceService.DeleteGoalAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Performance goal deleted successfully"));
    }

    [HttpPost("evaluations")]
    [Authorize(Roles = "Admin,Manager,HR")]
    public async Task<ActionResult<ApiResponse<PerformanceEvaluationDto>>> CreateEvaluation([FromBody] CreatePerformanceEvaluationRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PerformanceEvaluationDto>.ErrorResponse("Invalid input"));

        var evaluatorId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var evaluation = await _performanceService.CreateEvaluationAsync(evaluatorId, request);
        return Created("", ApiResponse<PerformanceEvaluationDto>.SuccessResponse(evaluation, "Performance evaluation created successfully"));
    }

    [HttpGet("evaluations/{id}")]
    public async Task<ActionResult<ApiResponse<PerformanceEvaluationDto>>> GetEvaluation(string id)
    {
        var evaluation = await _performanceService.GetEvaluationByIdAsync(id);
        if (evaluation == null)
            return NotFound(ApiResponse<PerformanceEvaluationDto>.ErrorResponse("Performance evaluation not found"));

        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "Manager" && role != "HR" && currentUserId != evaluation.UserId)
        {
            return Forbid();
        }

        return Ok(ApiResponse<PerformanceEvaluationDto>.SuccessResponse(evaluation, "Performance evaluation retrieved successfully"));
    }

    [HttpGet("evaluations/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PerformanceEvaluationDto>>>> GetUserEvaluations(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "Manager" && role != "HR" && currentUserId != userId)
        {
            return Forbid();
        }

        var evaluations = await _performanceService.GetUserEvaluationsAsync(userId);
        return Ok(ApiResponse<IEnumerable<PerformanceEvaluationDto>>.SuccessResponse(evaluations, "User evaluations retrieved successfully"));
    }

    [HttpGet("evaluations/period/{period}")]
    [Authorize(Roles = "Admin,Manager,HR")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PerformanceEvaluationDto>>>> GetPeriodEvaluations(string period)
    {
        var evaluations = await _performanceService.GetPeriodEvaluationsAsync(period);
        return Ok(ApiResponse<IEnumerable<PerformanceEvaluationDto>>.SuccessResponse(evaluations, "Period evaluations retrieved successfully"));
    }
}
