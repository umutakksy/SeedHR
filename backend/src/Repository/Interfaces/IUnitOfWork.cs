namespace SeedHR.Backend.Repository.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRepository<SeedHR.Backend.Models.Entities.Role> Roles { get; }
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
    IAssetRepository Assets { get; }
    IAssetAllocationRepository AssetAllocations { get; }
    IOnboardingPlanRepository OnboardingPlans { get; }
    IOnboardingTaskRepository OnboardingTasks { get; }
    IOnboardingInstanceRepository OnboardingInstances { get; }
    IOnboardingTaskCompletionRepository OnboardingTaskCompletions { get; }
    ICourseRepository Courses { get; }
    ICourseAssignmentRepository CourseAssignments { get; }
    ICompetencyFormRepository CompetencyForms { get; }
    IEvaluation360Repository Evaluations360 { get; }
    IReferenceCheckRepository ReferenceChecks { get; }
    IPayrollRepository Payrolls { get; }
    IExpenseRequestRepository ExpenseRequests { get; }
    IEmployeeShiftRepository EmployeeShifts { get; }
    IVisitorLogRepository VisitorLogs { get; }

    Task<bool> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
