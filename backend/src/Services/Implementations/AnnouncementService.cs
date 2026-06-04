namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class AnnouncementService : IAnnouncementService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public AnnouncementService(IUnitOfWork unitOfWork, INotificationService notificationService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<AnnouncementDto> CreateAnnouncementAsync(string createdBy, CreateAnnouncementRequest request)
    {
        var announcement = new Announcement
        {
            Title = request.Title,
            Content = request.Content,
            ImagePath = request.ImagePath,
            CreatedBy = createdBy,
            PublishedDate = DateTime.UtcNow,
            Status = "Published",
            Category = request.Category
        };

        var created = await _unitOfWork.Announcements.AddAsync(announcement);
        await _unitOfWork.SaveChangesAsync();

        var allUsers = await _unitOfWork.Users.GetAllAsync();
        foreach (var user in allUsers)
        {
            await _notificationService.CreateNotificationAsync(
                user.Id,
                $"New Announcement: {request.Title}",
                request.Content,
                "NewAnnouncement",
                created.Id,
                "Announcement");
        }

        return _mapper.Map<AnnouncementDto>(created);
    }

    public async Task<AnnouncementDto> GetAnnouncementByIdAsync(string id)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(id)
            ?? throw new NotFoundException($"Announcement with ID {id} not found");
        return _mapper.Map<AnnouncementDto>(announcement);
    }

    public async Task<IEnumerable<AnnouncementDto>> GetPublishedAnnouncementsAsync()
    {
        var announcements = await _unitOfWork.Announcements.GetPublishedAsync();
        return _mapper.Map<IEnumerable<AnnouncementDto>>(announcements);
    }

    public async Task<AnnouncementDto> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest request)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(id)
            ?? throw new NotFoundException($"Announcement with ID {id} not found");

        announcement.Title = request.Title;
        announcement.Content = request.Content;
        announcement.ImagePath = request.ImagePath;
        announcement.Category = request.Category;

        var updated = await _unitOfWork.Announcements.UpdateAsync(announcement);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AnnouncementDto>(updated);
    }

    public async Task<bool> DeleteAnnouncementAsync(string id)
    {
        return await _unitOfWork.Announcements.DeleteAsync(id);
    }
}
