namespace SeedHR.Backend.Models.DTOs;

public class AttendanceDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Date { get; set; } = null!; // String format YYYY-MM-DD
    public string? CheckIn { get; set; }     // String format HH:MM
    public string? CheckOut { get; set; }    // String format HH:MM
    public string Status { get; set; } = null!;
    public double? TotalHoursWorked { get; set; }
    public string? Notes { get; set; }
}
