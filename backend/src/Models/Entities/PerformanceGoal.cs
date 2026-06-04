namespace SeedHR.Backend.Models.Entities;

public class PerformanceGoal : BaseEntity
{
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "In Progress"; // In Progress, Completed, Failed
    public int TargetProgress { get; set; } // 0-100
    public int CurrentProgress { get; set; } // 0-100
    public string? Comments { get; set; }
}
