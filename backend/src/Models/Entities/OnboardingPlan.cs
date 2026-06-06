using System;

namespace SeedHR.Backend.Models.Entities;

public class OnboardingPlan : BaseEntity
{
    public string Name { get; set; } = null!; // e.g., "Software Developer OnboardingPlan"
    public string? DepartmentId { get; set; }
    public string? PositionId { get; set; }
    public int DurationDays { get; set; }
    public string Status { get; set; } = "Template"; // Template, Active, Archived
}
