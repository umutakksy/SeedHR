using System;

namespace SeedHR.Backend.Models.Entities;

public class OnboardingInstance : BaseEntity
{
    public string UserId { get; set; } = null!;
    public string OnboardingPlanId { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public string Status { get; set; } = "In Progress"; // In Progress, Completed, Delayed
    public double ProgressPercentage { get; set; }
}
