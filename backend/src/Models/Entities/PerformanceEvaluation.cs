namespace SeedHR.Backend.Models.Entities;

public class PerformanceEvaluation : BaseEntity
{
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string EvaluatedBy { get; set; } = null!;
    public DateTime EvaluationDate { get; set; }
    public string Period { get; set; } = null!; // Q1, Q2, Q3, Q4 or specific date range
    public int Rating { get; set; } // 1-5
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? Comments { get; set; }
    public List<PerformanceGoal> GoalsEvaluated { get; set; } = new();
}
