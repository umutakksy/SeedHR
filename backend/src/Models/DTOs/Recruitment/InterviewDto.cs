namespace SeedHR.Backend.Models.DTOs;

public class InterviewDto
{
    public string Id { get; set; } = null!;
    public string CandidateName { get; set; } = null!;
    public string InterviewerName { get; set; } = null!;
    public string JobTitle { get; set; } = null!;
    public DateTime ScheduledDate { get; set; }
    public string Type { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Location { get; set; }
    public int? Rating { get; set; }
    public string? Feedback { get; set; }
    public string? Result { get; set; }
}

public class CreateInterviewRequest
{
    public string CandidateId { get; set; } = null!;
    public string JobPostingId { get; set; } = null!;
    public DateTime ScheduledDate { get; set; }
    public string Type { get; set; } = null!;
    public string? Location { get; set; }
}

public class CompleteInterviewRequest
{
    public int Rating { get; set; }
    public string? Feedback { get; set; }
    public string Result { get; set; } = null!;
}
