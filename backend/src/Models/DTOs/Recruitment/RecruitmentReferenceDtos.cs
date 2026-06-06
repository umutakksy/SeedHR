using System;
using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class ReferenceCheckDto
{
    public string Id { get; set; } = null!;
    public string CandidateId { get; set; } = null!;
    public string CandidateName { get; set; } = null!;
    public string ReferenceName { get; set; } = null!;
    public string Company { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Relationship { get; set; } = null!; // Former Manager, Peer, HR
    public string Status { get; set; } = null!; // Pending, Sent, Completed
    public string? VerificationNotes { get; set; }
    public Dictionary<string, int> Scores { get; set; } = new();
    public string? Comments { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReferenceCheckRequest
{
    public string ReferenceName { get; set; } = null!;
    public string Company { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Relationship { get; set; } = null!; // Former Manager, Peer, HR
}

public class SubmitReferenceFeedbackRequest
{
    public string? VerificationNotes { get; set; }
    public Dictionary<string, int> Scores { get; set; } = new();
    public string? Comments { get; set; }
}
