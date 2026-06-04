namespace SeedHR.Backend.Models.DTOs;

public class UpdateDepartmentRequest
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ManagerId { get; set; }
    public bool IsActive { get; set; }
}
