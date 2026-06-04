namespace SeedHR.Backend.Models.DTOs;

public class DocumentDto
{
    public string Id { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;
    public string DocumentType { get; set; } = null!;
    public long FileSize { get; set; }
    public string UserId { get; set; } = null!;
}
