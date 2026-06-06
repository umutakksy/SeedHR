using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class CreateOnboardingPlanRequest
{
    public string Name { get; set; } = null!;
    public string? DepartmentId { get; set; }
    public string? PositionId { get; set; }
    public int DurationDays { get; set; }
    public string Status { get; set; } = "Template"; // Template, Active, Archived
    public List<CreateOnboardingTaskRequest> Tasks { get; set; } = new();
}

public class CreateOnboardingTaskRequest
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!; // Document, Training, System, Meeting
    public int DueDay { get; set; }
    public string AssignedToRole { get; set; } = "Employee"; // HR, Manager, IT, Employee
    public bool IsMandatory { get; set; } = true;
    public int Order { get; set; }
}
