namespace SeedHR.Backend.Models.DTOs;

public class LeaveApprovalRequest
{
    public string LeaveRequestId { get; set; } = null!;
    public bool Approve { get; set; }
    public string? RejectionReason { get; set; }
}
