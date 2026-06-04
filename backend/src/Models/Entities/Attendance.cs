namespace SeedHR.Backend.Models.Entities;

public class Attendance : BaseEntity
{
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string WorkScheduleId { get; set; } = null!;
    public WorkSchedule? WorkSchedule { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public string Status { get; set; } = "Present"; // Present, Absent, Late, Left Early, On Leave
    public string? Notes { get; set; }
}
