using System;

namespace SeedHR.Backend.Models.DTOs;

public class WorkScheduleDto
{
    public string Id { get; set; } = null!;
    public DateTime Date { get; set; }
    public string Type { get; set; } = null!;
    public string? Description { get; set; }
    public int DayOfWeek { get; set; }
}

public class CreateWorkScheduleRequest
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = null!;
    public string? Description { get; set; }
    public int DayOfWeek { get; set; }
}
