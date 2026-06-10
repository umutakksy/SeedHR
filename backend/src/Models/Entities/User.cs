namespace SeedHR.Backend.Models.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = null!;
    public string IdentityNumber { get; set; } = null!;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }

    // İş Bilgileri
    public string? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public string? PositionId { get; set; }
    public Position? Position { get; set; }
    public string? ManagerId { get; set; }
    public User? Manager { get; set; }
    public DateTime? HireDate { get; set; }
    public string? Location { get; set; }
    public decimal BaseSalary { get; set; }

    // Acil durum kişisi
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }

    // Rol ve Yetkilendirme
    public string RoleId { get; set; } = null!;
    public Role? Role { get; set; }
    public List<Document> Documents { get; set; } = new();

    // Token Management
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public string FullName => $"{FirstName} {LastName}";
}
