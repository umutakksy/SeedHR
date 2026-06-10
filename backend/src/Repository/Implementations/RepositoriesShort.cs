namespace SeedHR.Backend.Repository.Implementations;

using MongoDB.Driver;
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
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);
        return await FirstOrDefaultAsync(a => a.UserId == userId && a.CheckInTime.HasValue && a.CheckInTime.Value >= startOfDay && a.CheckInTime.Value < endOfDay);
    }

    public async Task<IEnumerable<Attendance>> GetByUserAsync(string userId)
        => await FindAsync(a => a.UserId == userId);

    public async Task<IEnumerable<Attendance>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var start = startDate.Date;
        var end = endDate.Date.AddDays(1);
        return await FindAsync(a => a.CheckInTime.HasValue && a.CheckInTime.Value >= start && a.CheckInTime.Value < end);
    }

    public async Task<IEnumerable<Attendance>> GetByUserDateRangeAsync(string userId, DateTime startDate, DateTime endDate)
    {
        var start = startDate.Date;
        var end = endDate.Date.AddDays(1);
        return await FindAsync(a => a.UserId == userId && a.CheckInTime.HasValue && a.CheckInTime.Value >= start && a.CheckInTime.Value < end);
    }

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
        var filter = Builders<Announcement>.Filter.And(
            Builders<Announcement>.Filter.Eq(a => a.Status, "Published"),
            Builders<Announcement>.Filter.Eq(a => a.IsActive, true)
        );
        return await _collection.Find(filter)
            .SortByDescending(a => a.PublishedDate)
            .Limit(count)
            .ToListAsync();
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
        var filter = Builders<Candidate>.Filter.Eq(c => c.IsActive, true);
        return await _collection.Find(filter)
            .SortByDescending(c => c.AppliedDate)
            .Limit(count)
            .ToListAsync();
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
        var filter = Builders<Notification>.Filter.And(
            Builders<Notification>.Filter.Eq(n => n.UserId, userId),
            Builders<Notification>.Filter.Eq(n => n.IsRead, false),
            Builders<Notification>.Filter.Eq(n => n.IsActive, true)
        );
        var update = Builders<Notification>.Update
            .Set(n => n.IsRead, true)
            .Set(n => n.UpdatedAt, DateTime.UtcNow);
        await _collection.UpdateManyAsync(filter, update);
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

    public async Task<double> GetAverageRatingAsync()
    {
        var filter = Builders<PerformanceEvaluation>.Filter.Eq(e => e.IsActive, true);
        var result = await _collection.Aggregate()
            .Match(filter)
            .Group(x => 1, g => new { Avg = g.Average(x => (double)x.Rating) })
            .FirstOrDefaultAsync();
        return result != null ? Math.Round(result.Avg, 1) : 0.0;
    }
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

public class AssetRepository : MongoRepository<Asset>, IAssetRepository
{
    public AssetRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Asset>> GetAvailableAssetsAsync()
        => await FindAsync(a => a.Status == "Available" && a.IsActive);

    public async Task<IEnumerable<Asset>> GetAssetsByUserAsync(string userId)
        => await FindAsync(a => a.CurrentAssigneeId == userId && a.IsActive);

    public async Task<IEnumerable<Asset>> GetAssetsByStatusAsync(string status)
        => await FindAsync(a => a.Status == status && a.IsActive);
}

public class AssetAllocationRepository : MongoRepository<AssetAllocation>, IAssetAllocationRepository
{
    public AssetAllocationRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<AssetAllocation>> GetAllocationsByUserAsync(string userId)
        => await FindAsync(aa => aa.UserId == userId && aa.IsActive);

    public async Task<IEnumerable<AssetAllocation>> GetAllocationsByAssetAsync(string assetId)
        => await FindAsync(aa => aa.AssetId == assetId && aa.IsActive);

    public async Task<AssetAllocation?> GetActiveAllocationAsync(string assetId)
        => await FirstOrDefaultAsync(aa => aa.AssetId == assetId && aa.ReturnDate == null && aa.IsActive);
}

public class OnboardingPlanRepository : MongoRepository<OnboardingPlan>, IOnboardingPlanRepository
{
    public OnboardingPlanRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<OnboardingPlan>> GetPlansByDepartmentAsync(string departmentId)
        => await FindAsync(op => op.DepartmentId == departmentId && op.IsActive);

    public async Task<IEnumerable<OnboardingPlan>> GetPlansByPositionAsync(string positionId)
        => await FindAsync(op => op.PositionId == positionId && op.IsActive);
}

public class OnboardingTaskRepository : MongoRepository<OnboardingTask>, IOnboardingTaskRepository
{
    public OnboardingTaskRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<OnboardingTask>> GetTasksByPlanAsync(string planId)
        => await FindAsync(ot => ot.OnboardingPlanId == planId && ot.IsActive);
}

public class OnboardingInstanceRepository : MongoRepository<OnboardingInstance>, IOnboardingInstanceRepository
{
    public OnboardingInstanceRepository(IMongoDbContext context) : base(context) { }

    public async Task<OnboardingInstance?> GetActiveInstanceByUserAsync(string userId)
        => await FirstOrDefaultAsync(oi => oi.UserId == userId && oi.Status == "In Progress" && oi.IsActive);

    public async Task<IEnumerable<OnboardingInstance>> GetInstancesByPlanAsync(string planId)
        => await FindAsync(oi => oi.OnboardingPlanId == planId && oi.IsActive);
}

public class OnboardingTaskCompletionRepository : MongoRepository<OnboardingTaskCompletion>, IOnboardingTaskCompletionRepository
{
    public OnboardingTaskCompletionRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<OnboardingTaskCompletion>> GetCompletionsByInstanceAsync(string instanceId)
        => await FindAsync(otc => otc.OnboardingInstanceId == instanceId && otc.IsActive);

    public async Task<OnboardingTaskCompletion?> GetCompletionByTaskAsync(string instanceId, string taskId)
        => await FirstOrDefaultAsync(otc => otc.OnboardingInstanceId == instanceId && otc.TaskId == taskId && otc.IsActive);
}

public class CourseRepository : MongoRepository<Course>, ICourseRepository
{
    public CourseRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Course>> GetActiveCoursesAsync()
        => await FindAsync(c => c.IsActive);
}

public class CourseAssignmentRepository : MongoRepository<CourseAssignment>, ICourseAssignmentRepository
{
    public CourseAssignmentRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<CourseAssignment>> GetAssignmentsByUserAsync(string userId)
        => await FindAsync(ca => ca.UserId == userId && ca.IsActive);

    public async Task<IEnumerable<CourseAssignment>> GetAssignmentsByCourseAsync(string courseId)
        => await FindAsync(ca => ca.CourseId == courseId && ca.IsActive);

    public async Task<CourseAssignment?> GetAssignmentAsync(string userId, string courseId)
        => await FirstOrDefaultAsync(ca => ca.UserId == userId && ca.CourseId == courseId && ca.IsActive);
}

public class CompetencyFormRepository : MongoRepository<CompetencyForm>, ICompetencyFormRepository
{
    public CompetencyFormRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<CompetencyForm>> GetByDepartmentAsync(string departmentId)
        => await FindAsync(cf => cf.DepartmentId == departmentId && cf.IsActive);
}

public class Evaluation360Repository : MongoRepository<Evaluation360>, IEvaluation360Repository
{
    public Evaluation360Repository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Evaluation360>> GetEvaluationsForEmployeeAsync(string employeeId, string period)
        => await FindAsync(e => e.EmployeeId == employeeId && e.Period == period && e.IsActive);

    public async Task<IEnumerable<Evaluation360>> GetEvaluationsByEvaluatorAsync(string evaluatorId)
        => await FindAsync(e => e.EvaluatorId == evaluatorId && e.IsActive);

    public async Task<Evaluation360?> GetSpecificEvaluationAsync(string employeeId, string evaluatorId, string period)
        => await FirstOrDefaultAsync(e => e.EmployeeId == employeeId && e.EvaluatorId == evaluatorId && e.Period == period && e.IsActive);
}

public class ReferenceCheckRepository : MongoRepository<ReferenceCheck>, IReferenceCheckRepository
{
    public ReferenceCheckRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<ReferenceCheck>> GetReferencesByCandidateAsync(string candidateId)
        => await FindAsync(rc => rc.CandidateId == candidateId && rc.IsActive);

    public async Task<ReferenceCheck?> GetByEmailAndCandidateAsync(string email, string candidateId)
        => await FirstOrDefaultAsync(rc => rc.Email == email && rc.CandidateId == candidateId && rc.IsActive);
}

public class PayrollRepository : MongoRepository<Payroll>, IPayrollRepository
{
    public PayrollRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<Payroll>> GetPayrollsByUserAsync(string userId)
        => await FindAsync(p => p.UserId == userId && p.IsActive);

    public async Task<Payroll?> GetPayrollByUserAndPeriodAsync(string userId, string period)
        => await FirstOrDefaultAsync(p => p.UserId == userId && p.Period == period && p.IsActive);

    public async Task<IEnumerable<Payroll>> GetPayrollsByPeriodAsync(string period)
        => await FindAsync(p => p.Period == period && p.IsActive);
}

public class ExpenseRequestRepository : MongoRepository<ExpenseRequest>, IExpenseRequestRepository
{
    public ExpenseRequestRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<ExpenseRequest>> GetExpensesByUserAsync(string userId)
        => await FindAsync(er => er.UserId == userId && er.IsActive);

    public async Task<IEnumerable<ExpenseRequest>> GetPendingExpensesAsync()
        => await FindAsync(er => er.Status == "Pending" && er.IsActive);
}

public class EmployeeShiftRepository : MongoRepository<EmployeeShift>, IEmployeeShiftRepository
{
    public EmployeeShiftRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<EmployeeShift>> GetShiftsByUserAsync(string userId)
        => await FindAsync(es => es.UserId == userId && es.IsActive);

    public async Task<IEnumerable<EmployeeShift>> GetShiftsByDateRangeAsync(DateTime start, DateTime end)
        => await FindAsync(es => es.Date >= start && es.Date <= end && es.IsActive);

    public async Task<EmployeeShift?> GetShiftByUserAndDateAsync(string userId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);
        return await FirstOrDefaultAsync(es => es.UserId == userId && es.Date >= startOfDay && es.Date < endOfDay && es.IsActive);
    }
}

public class VisitorLogRepository : MongoRepository<VisitorLog>, IVisitorLogRepository
{
    public VisitorLogRepository(IMongoDbContext context) : base(context) { }

    public async Task<IEnumerable<VisitorLog>> GetActiveVisitorLogsAsync()
        => await FindAsync(vl => (vl.Status == "Expected" || vl.Status == "CheckedIn") && vl.IsActive);
}

