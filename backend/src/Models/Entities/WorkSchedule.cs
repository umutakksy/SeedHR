namespace SeedHR.Backend.Models.Entities;

public class WorkSchedule : BaseEntity
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = null!; // Working, Holiday, Weekend
    public string? Description { get; set; }
    public int DayOfWeek { get; set; } // 0 = Sunday, 6 = Saturday
    public List<Attendance> Attendances { get; set; } = new();
}
