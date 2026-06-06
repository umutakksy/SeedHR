using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LmsController : ControllerBase
{
    private readonly ILmsService _lmsService;

    public LmsController(ILmsService lmsService)
    {
        _lmsService = lmsService;
    }

    [HttpPost("courses")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<CourseDto>>> CreateCourse([FromBody] CreateCourseRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<CourseDto>.ErrorResponse("Invalid input"));

        var course = await _lmsService.CreateCourseAsync(request);
        return Created("", ApiResponse<CourseDto>.SuccessResponse(course, "Course created successfully"));
    }

    [HttpGet("courses/{id}")]
    public async Task<ActionResult<ApiResponse<CourseDto>>> GetCourseById(string id)
    {
        var course = await _lmsService.GetCourseByIdAsync(id);
        return Ok(ApiResponse<CourseDto>.SuccessResponse(course, "Course retrieved successfully"));
    }

    [HttpGet("courses")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CourseDto>>>> GetActiveCourses()
    {
        var courses = await _lmsService.GetActiveCoursesAsync();
        return Ok(ApiResponse<IEnumerable<CourseDto>>.SuccessResponse(courses, "Active courses retrieved successfully"));
    }

    [HttpGet("courses/all")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CourseDto>>>> GetAllCourses()
    {
        var courses = await _lmsService.GetAllCoursesAsync();
        return Ok(ApiResponse<IEnumerable<CourseDto>>.SuccessResponse(courses, "All courses retrieved successfully"));
    }

    [HttpDelete("courses/{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCourse(string id)
    {
        var result = await _lmsService.DeleteCourseAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Course deleted successfully"));
    }

    [HttpPost("assignments")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<CourseAssignmentDto>>> AssignCourse([FromBody] AssignCourseRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<CourseAssignmentDto>.ErrorResponse("Invalid input"));

        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var assignment = await _lmsService.AssignCourseAsync(currentUserId, request);
        return Ok(ApiResponse<CourseAssignmentDto>.SuccessResponse(assignment, "Course assigned successfully"));
    }

    [HttpPost("assignments/{id}/complete")]
    public async Task<ActionResult<ApiResponse<CourseAssignmentDto>>> CompleteCourse(string id, [FromQuery] string? certificateUrl)
    {
        var assignment = await _lmsService.CompleteCourseAsync(id, certificateUrl);
        return Ok(ApiResponse<CourseAssignmentDto>.SuccessResponse(assignment, "Course marked as completed successfully"));
    }

    [HttpGet("assignments/user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CourseAssignmentDto>>>> GetUserAssignments(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && role != "Manager" && currentUserId != userId)
        {
            return Forbid();
        }

        var assignments = await _lmsService.GetUserAssignmentsAsync(userId);
        return Ok(ApiResponse<IEnumerable<CourseAssignmentDto>>.SuccessResponse(assignments, "User assignments retrieved successfully"));
    }

    [HttpGet("assignments/course/{courseId}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CourseAssignmentDto>>>> GetCourseAssignments(string courseId)
    {
        var assignments = await _lmsService.GetCourseAssignmentsAsync(courseId);
        return Ok(ApiResponse<IEnumerable<CourseAssignmentDto>>.SuccessResponse(assignments, "Course assignments retrieved successfully"));
    }

    [HttpGet("assignments/all")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CourseAssignmentDto>>>> GetAllAssignments()
    {
        var assignments = await _lmsService.GetAllAssignmentsAsync();
        return Ok(ApiResponse<IEnumerable<CourseAssignmentDto>>.SuccessResponse(assignments, "All course assignments retrieved successfully"));
    }
}
