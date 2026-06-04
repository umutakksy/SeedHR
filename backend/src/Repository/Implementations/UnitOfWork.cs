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
