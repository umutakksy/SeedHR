using System;
using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class CompetencyItemDto
{
    public string Id { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string Question { get; set; } = null!;
    public double Weight { get; set; }
}

public class CompetencyFormDto
{
    public string Id { get; set; } = null!;
    public string? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<CompetencyItemDto> Competencies { get; set; } = new();
}

public class CreateCompetencyFormRequest
{
    public string? DepartmentId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<CompetencyItemDto> Competencies { get; set; } = new();
}

public class Evaluation360Dto
{
    public string Id { get; set; } = null!;
    public string EmployeeId { get; set; } = null!;
    public string EmployeeName { get; set; } = null!;
    public string EvaluatorId { get; set; } = null!;
    public string EvaluatorName { get; set; } = null!;
    public string EvaluatorType { get; set; } = null!; // Self, Manager, Peer, Subordinate
    public string CompetencyFormId { get; set; } = null!;
    public string CompetencyFormTitle { get; set; } = null!;
    public Dictionary<string, int> Scores { get; set; } = new();
    public string? Feedback { get; set; }
    public string Status { get; set; } = null!;
    public string Period { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class Create360Request
{
    public string EmployeeId { get; set; } = null!;
    public string EvaluatorId { get; set; } = null!;
    public string EvaluatorType { get; set; } = null!; // Self, Manager, Peer, Subordinate
    public string CompetencyFormId { get; set; } = null!;
    public string Period { get; set; } = null!;
}

public class Submit360ScoresRequest
{
    public Dictionary<string, int> Scores { get; set; } = new();
    public string? Feedback { get; set; }
}
