using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class OnboardingPlanDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionId { get; set; }
    public string? PositionTitle { get; set; }
    public int DurationDays { get; set; }
    public string Status { get; set; } = null!;
    public List<OnboardingTaskDto> Tasks { get; set; } = new();
}
