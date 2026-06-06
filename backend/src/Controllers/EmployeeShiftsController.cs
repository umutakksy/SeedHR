using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeShiftsController : ControllerBase
{
    private readonly IEmployeeShiftService _shiftService;

    public EmployeeShiftsController(IEmployeeShiftService shiftService)
    {
        _shiftService = shiftService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EmployeeShiftDto>>>> GetUserShifts(string userId)
    {
        var list = await _shiftService.GetShiftsByUserAsync(userId);
        return Ok(ApiResponse<IEnumerable<EmployeeShiftDto>>.SuccessResponse(list, "User shifts retrieved successfully"));
    }

    [HttpGet("range")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EmployeeShiftDto>>>> GetShiftsByRange([FromQuery] string start, [FromQuery] string end)
    {
        if (!DateTime.TryParse(start, out var startDate) || !DateTime.TryParse(end, out var endDate))
        {
            return BadRequest(ApiResponse<IEnumerable<EmployeeShiftDto>>.ErrorResponse("Invalid date format. Use YYYY-MM-DD"));
        }

        var list = await _shiftService.GetShiftsByDateRangeAsync(startDate, endDate);
        return Ok(ApiResponse<IEnumerable<EmployeeShiftDto>>.SuccessResponse(list, "Shifts retrieved successfully"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<EmployeeShiftDto>>> AssignShift([FromBody] CreateEmployeeShiftRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<EmployeeShiftDto>.ErrorResponse("Invalid input"));

        var shift = await _shiftService.AssignShiftAsync(request);
        return Created("", ApiResponse<EmployeeShiftDto>.SuccessResponse(shift, "Shift assigned successfully"));
    }
}
