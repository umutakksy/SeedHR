namespace SeedHR.Backend.Models.Entities;

using System;

public class Course : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!;// Online, Classroom
    public int DurationHours { get; set; }
    public string Provider { get; set; } = null!;
    public string? DocumentUrl { get; set; }
}
