namespace SeedHR.Backend.Models.DTOs;

public class AnnouncementDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? ImagePath { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime PublishedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string Status { get; set; } = null!;
    public string? Category { get; set; }
}

public class CreateAnnouncementRequest
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? ImagePath { get; set; }
    public string? Category { get; set; }
}

public class UpdateAnnouncementRequest
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? ImagePath { get; set; }
    public string? Category { get; set; }
}
