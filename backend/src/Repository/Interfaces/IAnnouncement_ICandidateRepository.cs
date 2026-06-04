namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface IAnnouncementRepository : IRepository<Announcement>
{
    Task<IEnumerable<Announcement>> GetPublishedAsync();
    Task<IEnumerable<Announcement>> GetByStatusAsync(string status);
    Task<IEnumerable<Announcement>> GetByCategoryAsync(string category);
    Task<IEnumerable<Announcement>> GetRecentAsync(int count = 10);
}

public interface ICandidateRepository : IRepository<Candidate>
{
    Task<Candidate?> GetByEmailAsync(string email);
    Task<IEnumerable<Candidate>> GetByStatusAsync(string status);
    Task<IEnumerable<Candidate>> GetRecentAsync(int count = 10);
}

public interface IJobPostingRepository : IRepository<JobPosting>
{
    Task<IEnumerable<JobPosting>> GetOpenPostingsAsync();
    Task<JobPosting?> GetWithCandidatesAsync(string id);
    Task<IEnumerable<JobPosting>> GetByStatusAsync(string status);
}

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByUserAsync(string userId);
    Task<IEnumerable<Notification>> GetUnreadByUserAsync(string userId);
    Task<bool> MarkAsReadAsync(string notificationId);
    Task<bool> MarkAllAsReadAsync(string userId);
}
