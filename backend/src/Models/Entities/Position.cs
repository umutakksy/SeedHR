namespace SeedHR.Backend.Models.Entities;

public class Position : BaseEntity
{
    public string Title { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string DepartmentId { get; set; } = null!;
    public Department? Department { get; set; }
    public List<User> Employees { get; set; } = new();
}
