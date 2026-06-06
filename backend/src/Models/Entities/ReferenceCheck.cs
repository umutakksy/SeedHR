namespace SeedHR.Backend.Models.Entities;

using System;
using System.Collections.Generic;

public class ReferenceCheck : BaseEntity
{
    public string CandidateId { get; set; } = null!;
    public Candidate? Candidate { get; set; }
    public string ReferenceName { get; set; } = null!;
    public string Company { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Relationship { get; set; } = null!; // Former Manager, Peer, HR
    public string Status { get; set; } = null!; // Pending, Sent, Completed
    public string? VerificationNotes { get; set; }
    public Dictionary<string, int> Scores { get; set; } = new(); // Criteria -> Score (1-5)
    public string? Comments { get; set; }
}
