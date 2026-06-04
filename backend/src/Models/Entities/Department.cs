namespace SeedHR.Backend.Models.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ManagerId { get; set; }
    public User? Manager { get; set; }
    public List<User> Employees { get; set; } = new();
}
