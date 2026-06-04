namespace SeedHR.Backend.Models.Entities;

public class LeaveRequest : BaseEntity
{
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string LeaveTypeId { get; set; } = null!;
    public LeaveType? LeaveType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysRequested { get; set; }
    public string Reason { get; set; } = null!;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectionReason { get; set; }
}
