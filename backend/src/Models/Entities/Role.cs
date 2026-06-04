namespace SeedHR.Backend.Models.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<Permission> Permissions { get; set; } = new();
}
