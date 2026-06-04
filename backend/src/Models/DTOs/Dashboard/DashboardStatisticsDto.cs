namespace SeedHR.Backend.Models.DTOs;

public class DashboardStatisticsDto
{
    public int TotalEmployees { get; set; }
    public int NewEmployeesThisMonth { get; set; }
    public int PendingLeaveRequests { get; set; }
    public int OpenPositions { get; set; }
    public int ActiveAnnouncements { get; set; }
    public int ActiveLeaveRequests => PendingLeaveRequests;
    public int OpenJobPostings => OpenPositions;
    public double AveragePerformanceScore { get; set; }
    public int AttendanceRateToday { get; set; }
    public List<UpcomingBirthdayDto> UpcomingBirthdays { get; set; } = new();
    public List<UpcomingLeaveDto> UpcomingLeaves { get; set; } = new();
    public List<AnnouncementDto> RecentAnnouncements { get; set; } = new();
}

public class UpcomingBirthdayDto
{
    public string EmployeeName { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public int DaysUntilBirthday { get; set; }
}

public class UpcomingLeaveDto
{
    public string EmployeeName { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int Days { get; set; }
    public string LeaveType { get; set; } = null!;
}


