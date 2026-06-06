using System;
using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class OnboardingProgressDto
{
    public string InstanceId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string PlanId { get; set; } = null!;
    public string PlanName { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public string Status { get; set; } = null!;
    public double ProgressPercentage { get; set; }
    public List<OnboardingTaskStatusDto> Tasks { get; set; } = new();
}

public class OnboardingTaskStatusDto
{
    public string TaskId { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!;
    public int DueDay { get; set; }
    public string AssignedToRole { get; set; } = null!;
    public bool IsMandatory { get; set; }
    public string CompletionStatus { get; set; } = "Pending"; // Pending, Completed, Skipped
    public DateTime? CompletionDate { get; set; }
    public string? EvidenceUrl { get; set; }
}
