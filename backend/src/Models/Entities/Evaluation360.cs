namespace SeedHR.Backend.Models.Entities;

using System;
using System.Collections.Generic;

public class Evaluation360 : BaseEntity
{
    public string EmployeeId { get; set; } = null!;
    public User? Employee { get; set; }
    public string EvaluatorId { get; set; } = null!;
    public User? Evaluator { get; set; }
    public string EvaluatorType { get; set; } = null!; // Self, Manager, Peer, Subordinate
    public string CompetencyFormId { get; set; } = null!;
    public CompetencyForm? CompetencyForm { get; set; }
    public Dictionary<string, int> Scores { get; set; } = new(); // QuestionId -> Score (1-5)
    public string? Feedback { get; set; }
    public string Status { get; set; } = null!; // Draft, Submitted, SignedOff
    public string Period { get; set; } = null!; // e.g. 2026-Q2
}
