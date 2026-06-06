using System;

namespace SeedHR.Backend.Models.DTOs;

public class EmployeeShiftDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public DateTime Date { get; set; }
    public string ShiftType { get; set; } = null!;
    public string StartTime { get; set; } = null!;
    public string EndTime { get; set; } = null!;
    public string? Notes { get; set; }
}

public class CreateEmployeeShiftRequest
{
    public string UserId { get; set; } = null!;
    public DateTime Date { get; set; }
    public string ShiftType { get; set; } = "Morning"; // Morning, Evening, Night, Off
    public string StartTime { get; set; } = "08:00";
    public string EndTime { get; set; } = "16:00";
    public string? Notes { get; set; }
}

public class VisitorLogDto
{
    public string Id { get; set; } = null!;
    public string VisitorName { get; set; } = null!;
    public string? Company { get; set; }
    public string Purpose { get; set; } = null!;
    public string HostUserId { get; set; } = null!;
    public string HostUserName { get; set; } = null!;
    public DateTime? EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public string Status { get; set; } = null!;
    public string? BadgeNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVisitorLogRequest
{
    public string VisitorName { get; set; } = null!;
    public string? Company { get; set; }
    public string Purpose { get; set; } = null!;
    public string HostUserId { get; set; } = null!;
    public string? BadgeNumber { get; set; }
}
