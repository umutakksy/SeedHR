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
        var now = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1);
        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1);

        // Fire all independent DB queries in parallel
        var totalEmployeesTask        = _unitOfWork.Users.CountAsync();
        var newEmployeesTask          = _unitOfWork.Users.CountAsync(u => u.CreatedAt >= thisMonthStart);
        var pendingLeaveTask          = _unitOfWork.LeaveRequests.CountAsync(lr => lr.Status == "Pending");
        var openPositionsTask         = _unitOfWork.JobPostings.CountAsync(jp => jp.Status == "Open");
        var activeAnnouncementsTask   = _unitOfWork.Announcements.CountAsync(a => a.Status == "Published");
        var avgRatingTask             = _unitOfWork.PerformanceEvaluations.GetAverageRatingAsync();
        var activeUserCountTask       = _unitOfWork.Users.CountAsync(u => u.IsActive);
        var presentTodayTask          = _unitOfWork.Attendances.CountAsync(
            a => a.CheckInTime.HasValue && a.CheckInTime.Value >= todayStart && a.CheckInTime.Value < todayEnd
              && (a.Status == "Present" || a.Status == "Late")
        );
        var birthdaysTask             = _unitOfWork.Users.GetUpcomingBirthdaysAsync(7);
        var upcomingLeavesTask        = _unitOfWork.LeaveRequests.GetUpcomingLeavesAsync(7);
        var recentAnnouncementsTask   = _unitOfWork.Announcements.GetRecentAsync(5);

        await Task.WhenAll(
            totalEmployeesTask, newEmployeesTask, pendingLeaveTask,
            openPositionsTask, activeAnnouncementsTask, avgRatingTask,
            activeUserCountTask, presentTodayTask, birthdaysTask,
            upcomingLeavesTask, recentAnnouncementsTask
        );

        var activeUserCount = activeUserCountTask.Result;
        var presentToday    = presentTodayTask.Result;
        var attRate = activeUserCount > 0
            ? (int)Math.Round((double)presentToday / activeUserCount * 100)
            : 100;

        var stats = new DashboardStatisticsDto
        {
            TotalEmployees          = totalEmployeesTask.Result,
            NewEmployeesThisMonth   = newEmployeesTask.Result,
            PendingLeaveRequests    = pendingLeaveTask.Result,
            OpenPositions           = openPositionsTask.Result,
            ActiveAnnouncements     = activeAnnouncementsTask.Result,
            AveragePerformanceScore = avgRatingTask.Result,
            AttendanceRateToday     = attRate
        };

        stats.UpcomingBirthdays = birthdaysTask.Result.Select(u => new UpcomingBirthdayDto
        {
            EmployeeName      = u.FullName,
            DateOfBirth       = u.DateOfBirth,
            DaysUntilBirthday = DaysUntilBirthday(u.DateOfBirth, now)
        }).ToList();

        stats.UpcomingLeaves = upcomingLeavesTask.Result.Select(lr => new UpcomingLeaveDto
        {
            EmployeeName = lr.User?.FullName ?? "Unknown",
            StartDate    = lr.StartDate,
            EndDate      = lr.EndDate,
            Days         = lr.DaysRequested,
            LeaveType    = lr.LeaveType?.Name ?? "Unknown"
        }).ToList();

        stats.RecentAnnouncements = recentAnnouncementsTask.Result.Select(a => new AnnouncementDto
        {
            Id            = a.Id,
            Title         = a.Title,
            Content       = a.Content,
            Category      = a.Category,
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
