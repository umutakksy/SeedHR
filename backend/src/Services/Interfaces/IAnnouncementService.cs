namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;



public interface IAnnouncementService
{
    Task<AnnouncementDto> CreateAnnouncementAsync(string createdBy, CreateAnnouncementRequest request);
    Task<AnnouncementDto> GetAnnouncementByIdAsync(string id);
    Task<IEnumerable<AnnouncementDto>> GetPublishedAnnouncementsAsync();
    Task<AnnouncementDto> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest request);
    Task<bool> DeleteAnnouncementAsync(string id);
}
