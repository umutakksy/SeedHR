namespace SeedHR.Backend.Models.Entities;

public class Notification : BaseEntity
{
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Type { get; set; } = null!; // LeaveApproval, LeaveRejection, NewAnnouncement, Interview, etc.
    public string? RelatedEntityId { get; set; } // İlgili entity'nin ID'si
    public string? RelatedEntityType { get; set; } // İlgili entity'nin type'ı
    public bool IsRead { get; set; }
    public DateTime SentDate { get; set; }
}
