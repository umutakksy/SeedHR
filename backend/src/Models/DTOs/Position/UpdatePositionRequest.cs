namespace SeedHR.Backend.Models.DTOs;

public class UpdatePositionRequest
{
    public string Title { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string DepartmentId { get; set; } = null!;
}
