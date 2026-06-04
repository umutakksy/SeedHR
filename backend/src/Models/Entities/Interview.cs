namespace SeedHR.Backend.Models.Entities;

public class Interview : BaseEntity
{
    public string CandidateId { get; set; } = null!;
    public Candidate? Candidate { get; set; }
    public string InterviewerUserId { get; set; } = null!;
    public User? InterviewerUser { get; set; }
    public string JobPostingId { get; set; } = null!;
    public JobPosting? JobPosting { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string Type { get; set; } = null!; // Phone, Video, In-Person
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled
    public string? Location { get; set; }
    public int? Rating { get; set; } // 1-5
    public string? Feedback { get; set; }
    public string? Result { get; set; } // Pass, Fail, Pending
}
