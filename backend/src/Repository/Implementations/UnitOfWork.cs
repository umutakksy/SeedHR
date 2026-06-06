namespace SeedHR.Backend.Repository.Implementations;

using MongoDB.Driver;
using SeedHR.Backend.Data;
using SeedHR.Backend.Repository.Interfaces;

public class UnitOfWork : IUnitOfWork
{
    private readonly IMongoDbContext _context;
    private IUserRepository? _userRepository;
    private IRepository<SeedHR.Backend.Models.Entities.Role>? _roleRepository;
    private IDepartmentRepository? _departmentRepository;
    private IPositionRepository? _positionRepository;
    private ILeaveRequestRepository? _leaveRequestRepository;
    private ILeaveBalanceRepository? _leaveBalanceRepository;
    private ILeaveTypeRepository? _leaveTypeRepository;
    private IAttendanceRepository? _attendanceRepository;
    private IAnnouncementRepository? _announcementRepository;
    private ICandidateRepository? _candidateRepository;
    private IJobPostingRepository? _jobPostingRepository;
    private INotificationRepository? _notificationRepository;
    private IPerformanceGoalRepository? _performanceGoalRepository;
    private IPerformanceEvaluationRepository? _performanceEvaluationRepository;
    private IInterviewRepository? _interviewRepository;
    private IDocumentRepository? _documentRepository;
    private IWorkScheduleRepository? _workScheduleRepository;
    private IAssetRepository? _assetRepository;
    private IAssetAllocationRepository? _assetAllocationRepository;
    private IOnboardingPlanRepository? _onboardingPlanRepository;
    private IOnboardingTaskRepository? _onboardingTaskRepository;
    private IOnboardingInstanceRepository? _onboardingInstanceRepository;
    private IOnboardingTaskCompletionRepository? _onboardingTaskCompletionRepository;
    private ICourseRepository? _courseRepository;
    private ICourseAssignmentRepository? _courseAssignmentRepository;
    private ICompetencyFormRepository? _competencyFormRepository;
    private IEvaluation360Repository? _evaluation360Repository;
    private IReferenceCheckRepository? _referenceCheckRepository;
    private IPayrollRepository? _payrollRepository;
    private IExpenseRequestRepository? _expenseRequestRepository;
    private IEmployeeShiftRepository? _employeeShiftRepository;
    private IVisitorLogRepository? _visitorLogRepository;

    private IClientSessionHandle? _session;

    public UnitOfWork(IMongoDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _userRepository ??= new UserRepository(_context);
    public IRepository<SeedHR.Backend.Models.Entities.Role> Roles => _roleRepository ??= new MongoRepository<SeedHR.Backend.Models.Entities.Role>(_context);
    public IDepartmentRepository Departments => _departmentRepository ??= new DepartmentRepository(_context);
    public IPositionRepository Positions => _positionRepository ??= new PositionRepository(_context);
    public ILeaveRequestRepository LeaveRequests => _leaveRequestRepository ??= new LeaveRequestRepository(_context);
    public ILeaveBalanceRepository LeaveBalances => _leaveBalanceRepository ??= new LeaveBalanceRepository(_context);
    public ILeaveTypeRepository LeaveTypes => _leaveTypeRepository ??= new LeaveTypeRepository(_context);
    public IAttendanceRepository Attendances => _attendanceRepository ??= new AttendanceRepository(_context);
    public IAnnouncementRepository Announcements => _announcementRepository ??= new AnnouncementRepository(_context);
    public ICandidateRepository Candidates => _candidateRepository ??= new CandidateRepository(_context);
    public IJobPostingRepository JobPostings => _jobPostingRepository ??= new JobPostingRepository(_context);
    public INotificationRepository Notifications => _notificationRepository ??= new NotificationRepository(_context);
    public IPerformanceGoalRepository PerformanceGoals => _performanceGoalRepository ??= new PerformanceGoalRepository(_context);
    public IPerformanceEvaluationRepository PerformanceEvaluations => _performanceEvaluationRepository ??= new PerformanceEvaluationRepository(_context);
    public IInterviewRepository Interviews => _interviewRepository ??= new InterviewRepository(_context);
    public IDocumentRepository Documents => _documentRepository ??= new DocumentRepository(_context);
    public IWorkScheduleRepository WorkSchedules => _workScheduleRepository ??= new WorkScheduleRepository(_context);
    public IAssetRepository Assets => _assetRepository ??= new AssetRepository(_context);
    public IAssetAllocationRepository AssetAllocations => _assetAllocationRepository ??= new AssetAllocationRepository(_context);
    public IOnboardingPlanRepository OnboardingPlans => _onboardingPlanRepository ??= new OnboardingPlanRepository(_context);
    public IOnboardingTaskRepository OnboardingTasks => _onboardingTaskRepository ??= new OnboardingTaskRepository(_context);
    public IOnboardingInstanceRepository OnboardingInstances => _onboardingInstanceRepository ??= new OnboardingInstanceRepository(_context);
    public IOnboardingTaskCompletionRepository OnboardingTaskCompletions => _onboardingTaskCompletionRepository ??= new OnboardingTaskCompletionRepository(_context);
    public ICourseRepository Courses => _courseRepository ??= new CourseRepository(_context);
    public ICourseAssignmentRepository CourseAssignments => _courseAssignmentRepository ??= new CourseAssignmentRepository(_context);
    public ICompetencyFormRepository CompetencyForms => _competencyFormRepository ??= new CompetencyFormRepository(_context);
    public IEvaluation360Repository Evaluations360 => _evaluation360Repository ??= new Evaluation360Repository(_context);
    public IReferenceCheckRepository ReferenceChecks => _referenceCheckRepository ??= new ReferenceCheckRepository(_context);
    public IPayrollRepository Payrolls => _payrollRepository ??= new PayrollRepository(_context);
    public IExpenseRequestRepository ExpenseRequests => _expenseRequestRepository ??= new ExpenseRequestRepository(_context);
    public IEmployeeShiftRepository EmployeeShifts => _employeeShiftRepository ??= new EmployeeShiftRepository(_context);
    public IVisitorLogRepository VisitorLogs => _visitorLogRepository ??= new VisitorLogRepository(_context);

    public async Task<bool> SaveChangesAsync()
    {
        return true;
    }

    public async Task BeginTransactionAsync()
    {
        _session = await (_context as dynamic).GetClient().StartSessionAsync();
        _session.StartTransaction();
    }

    public async Task CommitTransactionAsync()
    {
        if (_session != null)
        {
            await _session.CommitTransactionAsync();
            await _session.AbortTransactionAsync();
            _session.Dispose();
            _session = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_session != null)
        {
            await _session.AbortTransactionAsync();
            _session.Dispose();
            _session = null;
        }
    }

    public void Dispose()
    {
        _session?.Dispose();
    }
}
