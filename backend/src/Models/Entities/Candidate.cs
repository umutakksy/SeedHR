namespace SeedHR.Backend.Models.Entities;

public class Candidate : BaseEntity
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? CVPath { get; set; }
    public string? CoverLetter { get; set; }
    public DateTime AppliedDate { get; set; }
    public string Status { get; set; } = "New"; // New, Reviewing, Shortlisted, Rejected, Hired
    public List<CandidateApplication> Applications { get; set; } = new();
    public List<Interview> Interviews { get; set; } = new();

    public string FullName => $"{FirstName} {LastName}";
}
