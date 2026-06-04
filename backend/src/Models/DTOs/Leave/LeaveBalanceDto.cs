namespace SeedHR.Backend.Models.DTOs;

public class LeaveBalanceDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string LeaveTypeId { get; set; } = null!;
    public string LeaveTypeName { get; set; } = null!;
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
    public double RemainingPercentage { get; set; }
}
