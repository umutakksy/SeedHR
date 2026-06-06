namespace SeedHR.Backend.Models.Entities;

public class OnboardingTask : BaseEntity
{
    public string OnboardingPlanId { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!; // Document, Training, System, Meeting
    public int DueDay { get; set; } // Relative to start date
    public string AssignedToRole { get; set; } = "Employee"; // HR, Manager, IT, Employee
    public bool IsMandatory { get; set; } = true;
    public int Order { get; set; }
}
