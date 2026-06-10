namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(string userId, string title, string message, string type, string? relatedEntityId = null, string? relatedEntityType = null);
    Task<NotificationDto> GetNotificationByIdAsync(string id);
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId);
    Task<PaginatedResponse<NotificationDto>> GetPagedUserNotificationsAsync(string userId, int page, int pageSize);
    Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(string userId);
    Task<bool> MarkAsReadAsync(string notificationId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task<bool> DeleteNotificationAsync(string id);
}
