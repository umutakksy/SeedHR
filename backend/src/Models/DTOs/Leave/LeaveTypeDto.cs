namespace SeedHR.Backend.Models.DTOs;

public class LeaveTypeDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int DefaultDays { get; set; }
    public bool RequiresApproval { get; set; }
    public bool IsActive { get; set; }
}
