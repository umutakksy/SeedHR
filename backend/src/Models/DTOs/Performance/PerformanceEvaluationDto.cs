namespace SeedHR.Backend.Models.DTOs;

public class PerformanceEvaluationDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string EvaluatedBy { get; set; } = null!;
    public DateTime EvaluationDate { get; set; }
    public string Period { get; set; } = null!;
    public int Rating { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? Comments { get; set; }
}

public class CreatePerformanceEvaluationRequest
{
    public string UserId { get; set; } = null!;
    public string Period { get; set; } = null!;
    public int Rating { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? Comments { get; set; }
}
