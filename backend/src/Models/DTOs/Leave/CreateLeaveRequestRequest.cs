namespace SeedHR.Backend.Models.DTOs;

public class CreateLeaveRequestRequest
{
    public string LeaveTypeId { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysRequested { get; set; }
    public string Reason { get; set; } = null!;
}
