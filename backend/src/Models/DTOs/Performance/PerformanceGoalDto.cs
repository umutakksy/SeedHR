namespace SeedHR.Backend.Models.DTOs;

public class PerformanceGoalDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = null!;
    public int TargetProgress { get; set; }
    public int CurrentProgress { get; set; }
    public string? Comments { get; set; }
}

public class CreatePerformanceGoalRequest
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public int TargetProgress { get; set; } = 100;
}
