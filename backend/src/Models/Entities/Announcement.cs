namespace SeedHR.Backend.Models.Entities;

public class Announcement : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? ImagePath { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime PublishedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string Status { get; set; } = "Published"; // Published, Draft, Archived
    public string? Category { get; set; }
}
