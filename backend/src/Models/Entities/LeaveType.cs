namespace SeedHR.Backend.Models.Entities;

public class LeaveType : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int DefaultDays { get; set; }
    public bool RequiresApproval { get; set; }
}
