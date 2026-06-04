namespace SeedHR.Backend.Models.Entities;

public class Document : BaseEntity
{
    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;
    public string DocumentType { get; set; } = null!; // CV, Diploma, Certificate
    public string FilePath { get; set; } = null!;
    public long FileSize { get; set; }
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
}
