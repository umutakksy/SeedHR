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
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<NotificationDto>>>> GetMyNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var notifications = await _notificationService.GetPagedUserNotificationsAsync(userId, page, pageSize);
        return Ok(ApiResponse<PaginatedResponse<NotificationDto>>.SuccessResponse(notifications, "Notifications retrieved successfully"));
    }

    [HttpGet("my/unread")]
    public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDto>>>> GetUnreadNotifications()
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var notifications = await _notificationService.GetUnreadNotificationsAsync(userId);
        return Ok(ApiResponse<IEnumerable<NotificationDto>>.SuccessResponse(notifications, "Unread notifications retrieved successfully"));
    }

    [HttpPut("{id}/read")]
    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(string id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Notification marked as read"));
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var result = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "All notifications marked as read"));
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<NotificationDto>>>> GetUserNotifications(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        // Employees can only fetch their own notifications
        if (role != "Admin" && role != "HR" && currentUserId != userId)
        {
            return Forbid();
        }

        var notifications = await _notificationService.GetPagedUserNotificationsAsync(userId, page, pageSize);
        return Ok(ApiResponse<PaginatedResponse<NotificationDto>>.SuccessResponse(notifications, "Notifications retrieved successfully"));
    }

    [HttpPost("user/{userId}/read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsReadForUser(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && currentUserId != userId)
        {
            return Forbid();
        }

        var result = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "All notifications marked as read"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(string id)
    {
        var result = await _notificationService.DeleteNotificationAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Notification deleted successfully"));
    }
}
