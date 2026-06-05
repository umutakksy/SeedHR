namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementsController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<IEnumerable<AnnouncementDto>>>> GetAllAnnouncements()
    {
        var announcements = await _announcementService.GetPublishedAnnouncementsAsync();
        return Ok(ApiResponse<IEnumerable<AnnouncementDto>>.SuccessResponse(announcements, "Announcements retrieved successfully"));
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<AnnouncementDto>>>> GetPublishedAnnouncements()
    {
        var announcements = await _announcementService.GetPublishedAnnouncementsAsync();
        return Ok(ApiResponse<IEnumerable<AnnouncementDto>>.SuccessResponse(announcements, "Published announcements retrieved successfully"));
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<AnnouncementDto>>> GetAnnouncementById(string id)
    {
        var announcement = await _announcementService.GetAnnouncementByIdAsync(id);
        return Ok(ApiResponse<AnnouncementDto>.SuccessResponse(announcement, "Announcement retrieved successfully"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<AnnouncementDto>>> CreateAnnouncement([FromBody] CreateAnnouncementRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AnnouncementDto>.ErrorResponse("Invalid input"));

        var createdBy = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value 
                        ?? User.FindFirst("sub")?.Value 
                        ?? "Sistem";
        var announcement = await _announcementService.CreateAnnouncementAsync(createdBy, request);
        return Created("", ApiResponse<AnnouncementDto>.SuccessResponse(announcement, "Announcement created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<AnnouncementDto>>> UpdateAnnouncement(string id, [FromBody] UpdateAnnouncementRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AnnouncementDto>.ErrorResponse("Invalid input"));

        var announcement = await _announcementService.UpdateAnnouncementAsync(id, request);
        return Ok(ApiResponse<AnnouncementDto>.SuccessResponse(announcement, "Announcement updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAnnouncement(string id)
    {
        var result = await _announcementService.DeleteAnnouncementAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Announcement deleted successfully"));
    }
}
