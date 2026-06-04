namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,HR")]
public class PositionsController : ControllerBase
{
    private readonly IPositionService _positionService;
    private readonly IUserService _userService;

    public PositionsController(IPositionService positionService, IUserService userService)
    {
        _positionService = positionService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<PositionDto>>>> GetAllPositions()
    {
        var positions = await _positionService.GetAllPositionsAsync();
        return Ok(ApiResponse<IEnumerable<PositionDto>>.SuccessResponse(positions, "Positions retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PositionDto>>> GetPositionById(string id)
    {
        var position = await _positionService.GetPositionByIdAsync(id);
        return Ok(ApiResponse<PositionDto>.SuccessResponse(position, "Position retrieved successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PositionDto>>> CreatePosition([FromBody] CreatePositionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PositionDto>.ErrorResponse("Invalid input"));

        var position = await _positionService.CreatePositionAsync(request);
        return Created("", ApiResponse<PositionDto>.SuccessResponse(position, "Position created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PositionDto>>> UpdatePosition(string id, [FromBody] UpdatePositionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PositionDto>.ErrorResponse("Invalid input"));

        var position = await _positionService.UpdatePositionAsync(id, request);
        return Ok(ApiResponse<PositionDto>.SuccessResponse(position, "Position updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePosition(string id)
    {
        var result = await _positionService.DeletePositionAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Position deleted successfully"));
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PositionDto>>>> GetPositionsByDepartment(string departmentId)
    {
        var positions = await _positionService.GetPositionsByDepartmentAsync(departmentId);
        return Ok(ApiResponse<IEnumerable<PositionDto>>.SuccessResponse(positions, "Department positions retrieved successfully"));
    }
}
