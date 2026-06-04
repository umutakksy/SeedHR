namespace SeedHR.Backend.Models.Entities;

public class JobPosting : BaseEntity
{
    public string PositionId { get; set; } = null!;
    public Position? Position { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public DateTime PostedDate { get; set; }
    public DateTime? ClosedDate { get; set; }
    public string Status { get; set; } = "Open"; // Open, Closed, Cancelled
    public int NumberOfPositions { get; set; }
    public List<Candidate> Candidates { get; set; } = new();
}
