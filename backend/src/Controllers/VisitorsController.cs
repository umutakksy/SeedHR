using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VisitorsController : ControllerBase
{
    private readonly IVisitorService _visitorService;

    public VisitorsController(IVisitorService visitorService)
    {
        _visitorService = visitorService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<VisitorLogDto>>>> GetAllVisitors([FromQuery] bool? activeOnly)
    {
        IEnumerable<VisitorLogDto> list;
        if (activeOnly == true)
        {
            list = await _visitorService.GetActiveVisitorLogsAsync();
        }
        else
        {
            list = await _visitorService.GetAllVisitorLogsAsync();
        }
        return Ok(ApiResponse<IEnumerable<VisitorLogDto>>.SuccessResponse(list, "Visitor logs retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<VisitorLogDto>>> GetVisitorById(string id)
    {
        var visitor = await _visitorService.GetVisitorByIdAsync(id);
        return Ok(ApiResponse<VisitorLogDto>.SuccessResponse(visitor, "Visitor retrieved successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<VisitorLogDto>>> CreateVisitor([FromBody] CreateVisitorLogRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<VisitorLogDto>.ErrorResponse("Invalid input"));

        var visitor = await _visitorService.CreateVisitorLogAsync(request);
        return Created("", ApiResponse<VisitorLogDto>.SuccessResponse(visitor, "Visitor log created successfully"));
    }

    [HttpPost("{id}/checkin")]
    [Authorize(Roles = "Admin,HR,Manager")] // Typically receptionists or security, represented by Admin/HR roles here
    public async Task<ActionResult<ApiResponse<VisitorLogDto>>> CheckInVisitor(string id)
    {
        var visitor = await _visitorService.CheckInVisitorAsync(id);
        return Ok(ApiResponse<VisitorLogDto>.SuccessResponse(visitor, "Visitor checked in successfully"));
    }

    [HttpPost("{id}/checkout")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<VisitorLogDto>>> CheckOutVisitor(string id)
    {
        var visitor = await _visitorService.CheckOutVisitorAsync(id);
        return Ok(ApiResponse<VisitorLogDto>.SuccessResponse(visitor, "Visitor checked out successfully"));
    }
}
