namespace SeedHR.Backend.Models.DTOs;

public class UserDto
{
    public string Id { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = null!;
    public string IdentityNumber { get; set; } = null!;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionId { get; set; }
    public string? PositionTitle { get; set; }
    public string? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public DateTime? HireDate { get; set; }
    public string? Location { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string RoleId { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public bool IsActive { get; set; }
    public string FullName => $"{FirstName} {LastName}";
}
