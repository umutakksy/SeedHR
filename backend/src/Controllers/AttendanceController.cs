namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    public class CheckInRequest
    {
        public string? UserId { get; set; }
        public string? Notes { get; set; }
    }

    public class CheckOutRequest
    {
        public string? UserId { get; set; }
    }

    [HttpPost("checkin")]
    public async Task<ActionResult<ApiResponse<AttendanceDto>>> CheckIn([FromBody] CheckInRequest? request)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? request?.UserId;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<AttendanceDto>.ErrorResponse("User ID is required"));

        var attendance = await _attendanceService.CheckInAsync(userId, request?.Notes);
        return Ok(ApiResponse<AttendanceDto>.SuccessResponse(attendance, "Check-in successful"));
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<ApiResponse<AttendanceDto>>> CheckOut([FromBody] CheckOutRequest? request)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? request?.UserId;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<AttendanceDto>.ErrorResponse("User ID is required"));

        var attendance = await _attendanceService.CheckOutAsync(userId);
        return Ok(ApiResponse<AttendanceDto>.SuccessResponse(attendance, "Check-out successful"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AttendanceDto>>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        PaginatedResponse<AttendanceDto> result;
        if (role == "Admin" || role == "HR")
        {
            result = await _attendanceService.GetPagedAttendanceAsync(page, pageSize);
        }
        else
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest(ApiResponse<PaginatedResponse<AttendanceDto>>.ErrorResponse("User ID is required"));
            
            var records = (await _attendanceService.GetUserAttendanceAsync(userId, DateTime.MinValue, DateTime.MaxValue)).ToList();
            var totalCount = records.Count;
            result = new PaginatedResponse<AttendanceDto>
            {
                Items = records.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        return Ok(ApiResponse<PaginatedResponse<AttendanceDto>>.SuccessResponse(result, "Attendance records retrieved successfully"));
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceDto>>>> GetByUser(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        // Employees can only fetch their own records
        if (role != "Admin" && role != "HR" && currentUserId != userId)
        {
            return Forbid();
        }

        var records = await _attendanceService.GetUserAttendanceAsync(userId, DateTime.MinValue, DateTime.MaxValue);
        return Ok(ApiResponse<IEnumerable<AttendanceDto>>.SuccessResponse(records, "Attendance records retrieved successfully"));
    }

    [HttpGet("records")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceDto>>>> GetUserAttendance([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(ApiResponse<IEnumerable<AttendanceDto>>.ErrorResponse("User ID is required"));

        var start = startDate ?? DateTime.MinValue;
        var end = endDate ?? DateTime.MaxValue;

        var records = await _attendanceService.GetUserAttendanceAsync(userId, start, end);
        return Ok(ApiResponse<IEnumerable<AttendanceDto>>.SuccessResponse(records, "Attendance records retrieved successfully"));
    }

    [HttpGet("{userId}/records")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceDto>>>> GetUserAttendanceByAdmin(string userId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.MinValue;
        var end = endDate ?? DateTime.MaxValue;

        var records = await _attendanceService.GetUserAttendanceAsync(userId, start, end);
        return Ok(ApiResponse<IEnumerable<AttendanceDto>>.SuccessResponse(records, "Attendance records retrieved successfully"));
    }
}
