namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public NotificationService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<NotificationDto> CreateNotificationAsync(string userId, string title, string message, string type, string? relatedEntityId = null, string? relatedEntityType = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            RelatedEntityId = relatedEntityId,
            RelatedEntityType = relatedEntityType,
            IsRead = false,
            SentDate = DateTime.UtcNow
        };

        var created = await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<NotificationDto>(created);
    }

    public async Task<NotificationDto> GetNotificationByIdAsync(string id)
    {
        var notification = await _unitOfWork.Notifications.GetByIdAsync(id)
            ?? throw new NotFoundException($"Notification with ID {id} not found");
        return _mapper.Map<NotificationDto>(notification);
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
    {
        var notifications = await _unitOfWork.Notifications.GetByUserAsync(userId);
        return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }

    public async Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(string userId)
    {
        var notifications = await _unitOfWork.Notifications.GetUnreadByUserAsync(userId);
        return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }

    public async Task<bool> MarkAsReadAsync(string notificationId)
    {
        var notification = await _unitOfWork.Notifications.GetByIdAsync(notificationId)
            ?? throw new NotFoundException($"Notification with ID {notificationId} not found");

        notification.IsRead = true;
        await _unitOfWork.Notifications.UpdateAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _unitOfWork.Notifications.GetUnreadByUserAsync(userId);
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            await _unitOfWork.Notifications.UpdateAsync(notification);
        }
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteNotificationAsync(string id)
    {
        return await _unitOfWork.Notifications.DeleteAsync(id);
    }
}
