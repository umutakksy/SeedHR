namespace SeedHR.Backend.Models.DTOs;

public class CreateDepartmentRequest
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ManagerId { get; set; }
}
