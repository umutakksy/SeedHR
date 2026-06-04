namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DashboardStatisticsDto> GetDashboardStatisticsAsync()
    {
        var allUsers = await _unitOfWork.Users.GetAllAsync();
        var now = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1);

        var evaluations = await _unitOfWork.PerformanceEvaluations.GetAllAsync();
        var avgScore = evaluations.Any() 
            ? Math.Round(evaluations.Average(e => (double)e.Rating), 1) 
            : 0.0;

        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1);
        var activeUserCount = await _unitOfWork.Users.CountAsync(u => u.IsActive);
        var presentToday = await _unitOfWork.Attendances.CountAsync(
            a => a.CheckInTime.HasValue && a.CheckInTime.Value >= todayStart && a.CheckInTime.Value < todayEnd && (a.Status == "Present" || a.Status == "Late")
        );
        var attRate = activeUserCount > 0 ? (int)Math.Round((double)presentToday / activeUserCount * 100) : 100;

        var stats = new DashboardStatisticsDto
        {
            TotalEmployees = await _unitOfWork.Users.CountAsync(),
            NewEmployeesThisMonth = await _unitOfWork.Users.CountAsync(
                u => u.CreatedAt >= thisMonthStart
            ),
            PendingLeaveRequests = await _unitOfWork.LeaveRequests.CountAsync(
                lr => lr.Status == "Pending"
            ),
            OpenPositions = await _unitOfWork.JobPostings.CountAsync(
                jp => jp.Status == "Open"
            ),
            ActiveAnnouncements = await _unitOfWork.Announcements.CountAsync(
                a => a.Status == "Published"
            ),
            AveragePerformanceScore = avgScore,
            AttendanceRateToday = attRate
        };

        // Upcoming Birthdays (7 days)
        var upcomingBirthdays = await _unitOfWork.Users.GetUpcomingBirthdaysAsync(7);
        stats.UpcomingBirthdays = upcomingBirthdays.Select(u => new UpcomingBirthdayDto
        {
            EmployeeName = u.FullName,
            DateOfBirth = u.DateOfBirth,
            DaysUntilBirthday = DaysUntilBirthday(u.DateOfBirth, now)
        }).ToList();

        // Upcoming Leaves (7 days)
        var upcomingLeaves = await _unitOfWork.LeaveRequests.GetUpcomingLeavesAsync(7);
        stats.UpcomingLeaves = upcomingLeaves.Select(lr => new UpcomingLeaveDto
        {
            EmployeeName = lr.User?.FullName ?? "Unknown",
            StartDate = lr.StartDate,
            EndDate = lr.EndDate,
            Days = lr.DaysRequested,
            LeaveType = lr.LeaveType?.Name ?? "Unknown"
        }).ToList();

        // Recent Announcements (5 items)
        var recentAnnouncements = await _unitOfWork.Announcements.GetRecentAsync(5);
        stats.RecentAnnouncements = recentAnnouncements.Select(a => new AnnouncementDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            Category = a.Category,
            PublishedDate = a.PublishedDate
        }).ToList();

        return stats;
    }

    private int DaysUntilBirthday(DateTime birthDate, DateTime today)
    {
        var nextBirthday = new DateTime(today.Year, birthDate.Month, birthDate.Day);
        if (nextBirthday < today)
            nextBirthday = nextBirthday.AddYears(1);

        return (int)(nextBirthday - today).TotalDays;
    }
}
