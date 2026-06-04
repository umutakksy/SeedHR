namespace SeedHR.Backend.Repository.Implementations;

using SeedHR.Backend.Data;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;

public class DepartmentRepository : MongoRepository<Department>, IDepartmentRepository
{
    public DepartmentRepository(IMongoDbContext context) : base(context) { }

    public async Task<Department?> GetByCodeAsync(string code)
        => await FirstOrDefaultAsync(d => d.Code == code);

    public async Task<Department?> GetWithEmployeesAsync(string id)
        => await GetByIdAsync(id);

    public async Task<IEnumerable<Department>> GetByManagerAsync(string managerId)
        => await FindAsync(d => d.ManagerId == managerId);
}

public class PositionRepository : MongoRepository<Position>, IPositionRepository
{
    public PositionRepository(IMongoDbContext context) : base(context) { }

    public async Task<Position?> GetByCodeAsync(string code)
        => await FirstOrDefaultAsync(p => p.Code == code);

    public async Task<Position?> GetWithEmployeesAsync(string id)
        => await GetByIdAsync(id);

    public async Task<IEnumerable<Position>> GetByDepartmentAsync(string departmentId)
        => await FindAsync(p => p.DepartmentId == departmentId);
}

public class LeaveTypeRepository : MongoRepository<LeaveType>, ILeaveTypeRepository
{
    public LeaveTypeRepository(IMongoDbContext context) : base(context) { }

    public async Task<LeaveType?> GetByCodeAsync(string code)
        => await FirstOrDefaultAsync(lt => lt.Code == code);
}

public class LeaveRequestRepository : MongoRepository<LeaveRequest>, ILeaveRequestRepository
{
    public LeaveRequestRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<LeaveRequest>> GetByUserAsync(string userId)
        => await FindAsync(lr => lr.UserId == userId);

    public async Task<IEnumerable<LeaveRequest>> GetPendingAsync()
        => await FindAsync(lr => lr.Status == "Pending");

    public async Task<IEnumerable<LeaveRequest>> GetByStatusAsync(string status)
        => await FindAsync(lr => lr.Status == status);

    public async Task<IEnumerable<LeaveRequest>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        => await FindAsync(lr => lr.StartDate >= startDate && lr.EndDate <= endDate);

    public async Task<IEnumerable<LeaveRequest>> GetOverlappingAsync(string userId, DateTime startDate, DateTime endDate)
        => await FindAsync(lr => lr.UserId == userId &&
                                 lr.Status != "Rejected" &&
                                 lr.Status != "Cancelled" &&
                                 lr.StartDate < endDate &&
                                 lr.EndDate > startDate);

    public async Task<IEnumerable<LeaveRequest>> GetUpcomingLeavesAsync(int days = 30)
    {
        var now = DateTime.UtcNow;
        var futureDate = now.AddDays(days);
        return await FindAsync(lr =>
            lr.Status == "Approved" &&
            lr.StartDate >= now &&
            lr.StartDate <= futureDate
        );
    }
}

public class LeaveBalanceRepository : MongoRepository<LeaveBalance>, ILeaveBalanceRepository
{
    public LeaveBalanceRepository(IMongoDbContext context) : base(context) { }

    public async Task<LeaveBalance?> GetByUserAndTypeAsync(string userId, string leaveTypeId)
        => await FirstOrDefaultAsync(lb => lb.UserId == userId && lb.LeaveTypeId == leaveTypeId);

    public async Task<IEnumerable<LeaveBalance>> GetByUserAsync(string userId)
        => await FindAsync(lb => lb.UserId == userId);

    public async Task<IEnumerable<LeaveBalance>> GetByLeaveTypeAsync(string leaveTypeId)
        => await FindAsync(lb => lb.LeaveTypeId == leaveTypeId);

    public async Task<IEnumerable<LeaveBalance>> GetByYearAsync(int year)
        => await FindAsync(lb => lb.Year == year);
}

public class AttendanceRepository : MongoRepository<Attendance>, IAttendanceRepository
{
    public AttendanceRepository(IMongoDbContext context) : base(context) { }

    public async Task<Attendance?> GetByUserAndDateAsync(string userId, DateTime date)
        => await FirstOrDefaultAsync(a => a.UserId == userId && a.CheckInTime.HasValue && a.CheckInTime.Value.Date == date.Date);

    public async Task<IEnumerable<Attendance>> GetByUserAsync(string userId)
        => await FindAsync(a => a.UserId == userId);

    public async Task<IEnumerable<Attendance>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        => await FindAsync(a => a.CheckInTime.HasValue && a.CheckInTime.Value.Date >= startDate.Date && a.CheckInTime.Value.Date <= endDate.Date);

    public async Task<IEnumerable<Attendance>> GetByUserDateRangeAsync(string userId, DateTime startDate, DateTime endDate)
        => await FindAsync(a => a.UserId == userId && a.CheckInTime.HasValue && a.CheckInTime.Value.Date >= startDate.Date && a.CheckInTime.Value.Date <= endDate.Date);

    public async Task<IEnumerable<Attendance>> GetByStatusAsync(string status)
        => await FindAsync(a => a.Status == status);
}

public class AnnouncementRepository : MongoRepository<Announcement>, IAnnouncementRepository
{
    public AnnouncementRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Announcement>> GetPublishedAsync()
        => await FindAsync(a => a.Status == "Published");

    public async Task<IEnumerable<Announcement>> GetByStatusAsync(string status)
        => await FindAsync(a => a.Status == status);

    public async Task<IEnumerable<Announcement>> GetByCategoryAsync(string category)
        => await FindAsync(a => a.Category == category);

    public async Task<IEnumerable<Announcement>> GetRecentAsync(int count = 10)
    {
        var all = await GetPublishedAsync();
        return all.OrderByDescending(a => a.PublishedDate).Take(count);
    }
}

public class CandidateRepository : MongoRepository<Candidate>, ICandidateRepository
{
    public CandidateRepository(IMongoDbContext context) : base(context) { }

    public async Task<Candidate?> GetByEmailAsync(string email)
        => await FirstOrDefaultAsync(c => c.Email == email);

    public async Task<IEnumerable<Candidate>> GetByStatusAsync(string status)
        => await FindAsync(c => c.Status == status);

    public async Task<IEnumerable<Candidate>> GetRecentAsync(int count = 10)
    {
        var all = await GetAllAsync();
        return all.OrderByDescending(c => c.AppliedDate).Take(count);
    }
}

public class JobPostingRepository : MongoRepository<JobPosting>, IJobPostingRepository
{
    public JobPostingRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<JobPosting>> GetOpenPostingsAsync()
        => await FindAsync(jp => jp.Status == "Open");

    public async Task<JobPosting?> GetWithCandidatesAsync(string id)
        => await GetByIdAsync(id);

    public async Task<IEnumerable<JobPosting>> GetByStatusAsync(string status)
        => await FindAsync(jp => jp.Status == status);
}

public class NotificationRepository : MongoRepository<Notification>, INotificationRepository
{
    public NotificationRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Notification>> GetByUserAsync(string userId)
        => await FindAsync(n => n.UserId == userId);

    public async Task<IEnumerable<Notification>> GetUnreadByUserAsync(string userId)
        => await FindAsync(n => n.UserId == userId && !n.IsRead);

    public async Task<bool> MarkAsReadAsync(string notificationId)
    {
        var notif = await GetByIdAsync(notificationId);
        if (notif == null) return false;

        notif.IsRead = true;
        await UpdateAsync(notif);
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var notifications = await GetUnreadByUserAsync(userId);
        foreach (var notif in notifications)
        {
            notif.IsRead = true;
            await UpdateAsync(notif);
        }
        return true;
    }
}

public class PerformanceGoalRepository : MongoRepository<PerformanceGoal>, IPerformanceGoalRepository
{
    public PerformanceGoalRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<PerformanceGoal>> GetByUserAsync(string userId)
        => await FindAsync(pg => pg.UserId == userId);
}

public class PerformanceEvaluationRepository : MongoRepository<PerformanceEvaluation>, IPerformanceEvaluationRepository
{
    public PerformanceEvaluationRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<PerformanceEvaluation>> GetByUserAsync(string userId)
        => await FindAsync(pe => pe.UserId == userId);

    public async Task<IEnumerable<PerformanceEvaluation>> GetByPeriodAsync(string period)
        => await FindAsync(pe => pe.Period == period);
}

public class InterviewRepository : MongoRepository<Interview>, IInterviewRepository
{
    public InterviewRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Interview>> GetByCandidateAsync(string candidateId)
        => await FindAsync(i => i.CandidateId == candidateId);

    public async Task<IEnumerable<Interview>> GetByInterviewerAsync(string interviewerId)
        => await FindAsync(i => i.InterviewerUserId == interviewerId);

    public async Task<IEnumerable<Interview>> GetUpcomingInterviewsAsync(int days = 30)
    {
        var now = DateTime.UtcNow;
        var futureDate = now.AddDays(days);
        return await FindAsync(i => i.ScheduledDate >= now && i.ScheduledDate <= futureDate);
    }
}

public class DocumentRepository : MongoRepository<Document>, IDocumentRepository
{
    public DocumentRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Document>> GetByUserAsync(string userId)
        => await FindAsync(d => d.UserId == userId);
}

public class WorkScheduleRepository : MongoRepository<WorkSchedule>, IWorkScheduleRepository
{
    public WorkScheduleRepository(IMongoDbContext context) : base(context) { }
}
