namespace SeedHR.Backend.Models.DTOs;

public class OnboardingTaskDto
{
    public string Id { get; set; } = null!;
    public string OnboardingPlanId { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!; // Document, Training, System, Meeting
    public int DueDay { get; set; }
    public string AssignedToRole { get; set; } = null!;
    public bool IsMandatory { get; set; }
    public int Order { get; set; }
}
