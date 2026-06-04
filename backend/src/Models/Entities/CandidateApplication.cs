namespace SeedHR.Backend.Models.Entities;

public class CandidateApplication : BaseEntity
{
    public string CandidateId { get; set; } = null!;
    public Candidate? Candidate { get; set; }
    public string JobPostingId { get; set; } = null!;
    public JobPosting? JobPosting { get; set; }
    public DateTime ApplicationDate { get; set; }
    public string Status { get; set; } = "Applied"; // Applied, Under Review, Shortlisted, Rejected, Accepted
    public string? ReviewNotes { get; set; }
}
