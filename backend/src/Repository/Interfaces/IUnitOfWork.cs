namespace SeedHR.Backend.Repository.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IDepartmentRepository Departments { get; }
    IPositionRepository Positions { get; }
    ILeaveRequestRepository LeaveRequests { get; }
    ILeaveBalanceRepository LeaveBalances { get; }
    ILeaveTypeRepository LeaveTypes { get; }
    IAttendanceRepository Attendances { get; }
    IAnnouncementRepository Announcements { get; }
    ICandidateRepository Candidates { get; }
    IJobPostingRepository JobPostings { get; }
    INotificationRepository Notifications { get; }
    IPerformanceGoalRepository PerformanceGoals { get; }
    IPerformanceEvaluationRepository PerformanceEvaluations { get; }
    IInterviewRepository Interviews { get; }
    IDocumentRepository Documents { get; }
    IWorkScheduleRepository WorkSchedules { get; }

    Task<bool> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
