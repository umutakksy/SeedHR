using System;

namespace SeedHR.Backend.Models.Entities;

public class VisitorLog : BaseEntity
{
    public string VisitorName { get; set; } = null!;
    public string? Company { get; set; }
    public string Purpose { get; set; } = null!;
    public string HostUserId { get; set; } = null!;
    public string HostUserName { get; set; } = null!;
    public DateTime? EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public string Status { get; set; } = "Expected"; // Expected, CheckedIn, CheckedOut
    public string? BadgeNumber { get; set; }
}
