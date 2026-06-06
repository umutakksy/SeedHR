namespace SeedHR.Backend.Models.DTOs;

public class CandidateDto
{
    public string Id { get; set; } = null!;
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
    public string Status { get; set; } = null!;
    public int? AiMatchScore { get; set; }
    public string FullName => $"{FirstName} {LastName}";
}

public class CreateCandidateRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? CoverLetter { get; set; }
}

public class JobPostingDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public DateTime PostedDate { get; set; }
    public DateTime? ClosedDate { get; set; }
    public string Status { get; set; } = null!;
    public int NumberOfPositions { get; set; }
    public int ApplicationCount { get; set; }
}

public class CreateJobPostingRequest
{
    public string PositionId { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public int NumberOfPositions { get; set; }
}

public class UpdateJobPostingRequest
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public int NumberOfPositions { get; set; }
    public string Status { get; set; } = null!;
}
