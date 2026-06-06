using System;

namespace SeedHR.Backend.Models.Entities;

public class OnboardingTaskCompletion : BaseEntity
{
    public string OnboardingInstanceId { get; set; } = null!;
    public string TaskId { get; set; } = null!;
    public string UserId { get; set; } = null!; // Who completed/approved
    public DateTime? CompletionDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Completed, Skipped
    public string? EvidenceUrl { get; set; }
    public string? Signature { get; set; }
}
