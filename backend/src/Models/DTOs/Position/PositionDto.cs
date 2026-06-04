namespace SeedHR.Backend.Models.DTOs;

public class PositionDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string DepartmentId { get; set; } = null!;
    public string DepartmentName { get; set; } = null!;
    public int EmployeeCount { get; set; }
    public bool IsActive { get; set; }
}
