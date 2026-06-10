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
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;

    public LeaveController(ILeaveService leaveService)
    {
        _leaveService = leaveService;
    }

    [HttpPost("requests")]
    public async Task<ActionResult<ApiResponse<LeaveRequestDto>>> CreateLeaveRequest([FromBody] CreateLeaveRequestRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<LeaveRequestDto>.ErrorResponse("Invalid input"));

        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<LeaveRequestDto>.ErrorResponse("User ID is required"));

        var leaveRequest = await _leaveService.CreateLeaveRequestAsync(userId, request);
        return Created("", ApiResponse<LeaveRequestDto>.SuccessResponse(leaveRequest, "Leave request created successfully"));
    }

    [HttpGet("requests")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<LeaveRequestDto>>>> GetUserLeaveRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<PaginatedResponse<LeaveRequestDto>>.ErrorResponse("User ID is required"));

        PaginatedResponse<LeaveRequestDto> leaveRequests;
        if (role == "Admin" || role == "HR" || role == "Manager")
        {
            leaveRequests = await _leaveService.GetPagedLeaveRequestsAsync(page, pageSize);
        }
        else
        {
            leaveRequests = await _leaveService.GetPagedUserLeaveRequestsAsync(userId, page, pageSize);
        }

        return Ok(ApiResponse<PaginatedResponse<LeaveRequestDto>>.SuccessResponse(leaveRequests, "Leave requests retrieved successfully"));
    }

    [HttpGet("requests/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveRequestDto>>>> GetLeaveRequestsByUser(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && role != "Manager" && currentUserId != userId)
        {
            return Forbid();
        }

        var leaveRequests = await _leaveService.GetUserLeaveRequestsAsync(userId);
        return Ok(ApiResponse<IEnumerable<LeaveRequestDto>>.SuccessResponse(leaveRequests, "Leave requests retrieved successfully"));
    }

    [HttpPut("requests/{id}/approve")]
    [Authorize(Roles = "Manager,HR,Admin")]
    public async Task<ActionResult<ApiResponse<LeaveRequestDto>>> ApproveLeaveRequest(string id)
    {
        var approverId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(approverId))
            return BadRequest(ApiResponse<LeaveRequestDto>.ErrorResponse("Approver ID is required"));

        var leaveRequest = await _leaveService.ApproveLeaveRequestAsync(id, approverId);
        return Ok(ApiResponse<LeaveRequestDto>.SuccessResponse(leaveRequest, "Leave request approved successfully"));
    }

    [HttpPut("requests/{id}/reject")]
    [Authorize(Roles = "Manager,HR,Admin")]
    public async Task<ActionResult<ApiResponse<LeaveRequestDto>>> RejectLeaveRequest(string id, [FromBody] LeaveApprovalRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<LeaveRequestDto>.ErrorResponse("Invalid input"));

        var approverId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(approverId))
            return BadRequest(ApiResponse<LeaveRequestDto>.ErrorResponse("Approver ID is required"));

        var leaveRequest = await _leaveService.RejectLeaveRequestAsync(id, approverId, request.RejectionReason ?? "No reason provided");
        return Ok(ApiResponse<LeaveRequestDto>.SuccessResponse(leaveRequest, "Leave request rejected successfully"));
    }

    [HttpGet("balances")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveBalanceDto>>>> GetLeaveBalances()
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<IEnumerable<LeaveBalanceDto>>.ErrorResponse("User ID is required"));

        var balances = await _leaveService.GetUserLeaveBalancesAsync(userId);
        return Ok(ApiResponse<IEnumerable<LeaveBalanceDto>>.SuccessResponse(balances, "Leave balances retrieved successfully"));
    }

    [HttpGet("balances/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveBalanceDto>>>> GetLeaveBalancesByUser(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && role != "Manager" && currentUserId != userId)
        {
            return Forbid();
        }

        var balances = await _leaveService.GetUserLeaveBalancesAsync(userId);
        return Ok(ApiResponse<IEnumerable<LeaveBalanceDto>>.SuccessResponse(balances, "Leave balances retrieved successfully"));
    }

    [HttpGet("types")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveTypeDto>>>> GetLeaveTypes()
    {
        var leaveTypes = await _leaveService.GetLeaveTypesAsync();
        return Ok(ApiResponse<IEnumerable<LeaveTypeDto>>.SuccessResponse(leaveTypes, "Leave types retrieved successfully"));
    }

    [HttpGet("pending")]
    [Authorize(Roles = "HR,Admin,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveRequestDto>>>> GetPendingLeaveRequests()
    {
        var leaveRequests = await _leaveService.GetPendingLeaveRequestsAsync();
        return Ok(ApiResponse<IEnumerable<LeaveRequestDto>>.SuccessResponse(leaveRequests, "Pending leave requests retrieved successfully"));
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveRequestDto>>>> GetUpcomingLeaves([FromQuery] int days = 30)
    {
        var leaveRequests = await _leaveService.GetUpcomingLeavesAsync(days);
        return Ok(ApiResponse<IEnumerable<LeaveRequestDto>>.SuccessResponse(leaveRequests, "Upcoming leaves retrieved successfully"));
    }
}
