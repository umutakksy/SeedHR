namespace SeedHR.Backend.Models.Entities;

using System;
using System.Collections.Generic;

public class CompetencyItem
{
    public string Id { get; set; } = null!;
    public string Category { get; set; } = null!; // e.g., Technical, Soft Skills, Leadership
    public string Question { get; set; } = null!;
    public double Weight { get; set; } // Percentage of final grade, e.g., 20.0
}

public class CompetencyForm : BaseEntity
{
    public string? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<CompetencyItem> Competencies { get; set; } = new();
}
