using System;

namespace SeedHR.Backend.Models.Entities;

public class EmployeeShift : BaseEntity
{
    public string UserId { get; set; } = null!;
    public DateTime Date { get; set; }
    public string ShiftType { get; set; } = "Morning"; // Morning, Evening, Night, Off
    public string StartTime { get; set; } = "08:00";
    public string EndTime { get; set; } = "16:00";
    public string? Notes { get; set; }
}
