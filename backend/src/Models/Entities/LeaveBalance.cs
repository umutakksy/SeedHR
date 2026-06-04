namespace SeedHR.Backend.Models.Entities;

public class LeaveBalance : BaseEntity
{
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string LeaveTypeId { get; set; } = null!;
    public LeaveType? LeaveType { get; set; }
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays => TotalDays - UsedDays;
}
