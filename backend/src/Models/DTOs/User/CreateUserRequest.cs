namespace SeedHR.Backend.Models.DTOs;

public class CreateUserRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
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
    public string? PositionId { get; set; }
    public string? ManagerId { get; set; }
    public DateTime? HireDate { get; set; }
    public string? Location { get; set; }
    public decimal BaseSalary { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string RoleId { get; set; } = null!;
}
