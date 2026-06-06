namespace SeedHR.Backend.Data;

using MongoDB.Bson;
using MongoDB.Driver;
using SeedHR.Backend.Configuration;
using SeedHR.Backend.Models.Entities;
using Microsoft.Extensions.Options;

public class MongoDbContext : IMongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> options)
    {
        var settings = options.Value;
        var connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? settings.ConnectionString;
        var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME") ?? settings.DatabaseName;

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Role> Roles => _database.GetCollection<Role>("roles");
    public IMongoCollection<Permission> Permissions => _database.GetCollection<Permission>("permissions");
    public IMongoCollection<Department> Departments => _database.GetCollection<Department>("departments");
    public IMongoCollection<Position> Positions => _database.GetCollection<Position>("positions");
    public IMongoCollection<Document> Documents => _database.GetCollection<Document>("documents");
    public IMongoCollection<LeaveType> LeaveTypes => _database.GetCollection<LeaveType>("leaveTypes");
    public IMongoCollection<LeaveRequest> LeaveRequests => _database.GetCollection<LeaveRequest>("leaveRequests");
    public IMongoCollection<LeaveBalance> LeaveBalances => _database.GetCollection<LeaveBalance>("leaveBalances");
    public IMongoCollection<WorkSchedule> WorkSchedules => _database.GetCollection<WorkSchedule>("workSchedules");
    public IMongoCollection<Attendance> Attendances => _database.GetCollection<Attendance>("attendances");
    public IMongoCollection<PerformanceGoal> PerformanceGoals => _database.GetCollection<PerformanceGoal>("performanceGoals");
    public IMongoCollection<PerformanceEvaluation> PerformanceEvaluations => _database.GetCollection<PerformanceEvaluation>("performanceEvaluations");
    public IMongoCollection<JobPosting> JobPostings => _database.GetCollection<JobPosting>("jobPostings");
    public IMongoCollection<Candidate> Candidates => _database.GetCollection<Candidate>("candidates");
    public IMongoCollection<CandidateApplication> CandidateApplications => _database.GetCollection<CandidateApplication>("candidateApplications");
    public IMongoCollection<Interview> Interviews => _database.GetCollection<Interview>("interviews");
    public IMongoCollection<Announcement> Announcements => _database.GetCollection<Announcement>("announcements");
    public IMongoCollection<Notification> Notifications => _database.GetCollection<Notification>("notifications");
    public IMongoCollection<Asset> Assets => _database.GetCollection<Asset>("assets");
    public IMongoCollection<AssetAllocation> AssetAllocations => _database.GetCollection<AssetAllocation>("assetAllocations");
    public IMongoCollection<OnboardingPlan> OnboardingPlans => _database.GetCollection<OnboardingPlan>("onboardingPlans");
    public IMongoCollection<OnboardingTask> OnboardingTasks => _database.GetCollection<OnboardingTask>("onboardingTasks");
    public IMongoCollection<OnboardingInstance> OnboardingInstances => _database.GetCollection<OnboardingInstance>("onboardingInstances");
    public IMongoCollection<OnboardingTaskCompletion> OnboardingTaskCompletions => _database.GetCollection<OnboardingTaskCompletion>("onboardingTaskCompletions");
    public IMongoCollection<Course> Courses => _database.GetCollection<Course>("courses");
    public IMongoCollection<CourseAssignment> CourseAssignments => _database.GetCollection<CourseAssignment>("courseAssignments");
    public IMongoCollection<CompetencyForm> CompetencyForms => _database.GetCollection<CompetencyForm>("competencyForms");
    public IMongoCollection<Evaluation360> Evaluations360 => _database.GetCollection<Evaluation360>("evaluations360");
    public IMongoCollection<ReferenceCheck> ReferenceChecks => _database.GetCollection<ReferenceCheck>("referenceChecks");
    public IMongoCollection<Payroll> Payrolls => _database.GetCollection<Payroll>("payrolls");
    public IMongoCollection<ExpenseRequest> ExpenseRequests => _database.GetCollection<ExpenseRequest>("expenseRequests");
    public IMongoCollection<EmployeeShift> EmployeeShifts => _database.GetCollection<EmployeeShift>("employeeShifts");
    public IMongoCollection<VisitorLog> VisitorLogs => _database.GetCollection<VisitorLog>("visitorLogs");

    public async Task CreateIndexesAsync()
    {
        // Users indexes
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true }
            )
        );
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.DepartmentId))
        );
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.PositionId))
        );

        // LeaveRequests indexes
        await LeaveRequests.Indexes.CreateOneAsync(
            new CreateIndexModel<LeaveRequest>(Builders<LeaveRequest>.IndexKeys.Ascending(lr => lr.UserId))
        );
        await LeaveRequests.Indexes.CreateOneAsync(
            new CreateIndexModel<LeaveRequest>(Builders<LeaveRequest>.IndexKeys.Ascending(lr => lr.Status))
        );
        await LeaveRequests.Indexes.CreateOneAsync(
            new CreateIndexModel<LeaveRequest>(Builders<LeaveRequest>.IndexKeys.Ascending(lr => lr.StartDate))
        );

        // Notifications indexes
        await Notifications.Indexes.CreateOneAsync(
            new CreateIndexModel<Notification>(Builders<Notification>.IndexKeys.Ascending(n => n.UserId))
        );
        await Notifications.Indexes.CreateOneAsync(
            new CreateIndexModel<Notification>(Builders<Notification>.IndexKeys.Ascending(n => n.IsRead))
        );

        // Announcements indexes
        await Announcements.Indexes.CreateOneAsync(
            new CreateIndexModel<Announcement>(Builders<Announcement>.IndexKeys.Ascending(a => a.Status))
        );
        await Announcements.Indexes.CreateOneAsync(
            new CreateIndexModel<Announcement>(Builders<Announcement>.IndexKeys.Ascending(a => a.PublishedDate))
        );
        await Announcements.Indexes.CreateOneAsync(
            new CreateIndexModel<Announcement>(Builders<Announcement>.IndexKeys.Ascending(a => a.Category))
        );

        // Attendance indexes
        await Attendances.Indexes.CreateOneAsync(
            new CreateIndexModel<Attendance>(Builders<Attendance>.IndexKeys.Ascending(a => a.UserId))
        );
        await Attendances.Indexes.CreateOneAsync(
            new CreateIndexModel<Attendance>(Builders<Attendance>.IndexKeys.Ascending(a => a.CheckInTime))
        );

        // PerformanceGoal indexes
        await PerformanceGoals.Indexes.CreateOneAsync(
            new CreateIndexModel<PerformanceGoal>(Builders<PerformanceGoal>.IndexKeys.Ascending(pg => pg.UserId))
        );
        await PerformanceEvaluations.Indexes.CreateOneAsync(
            new CreateIndexModel<PerformanceEvaluation>(Builders<PerformanceEvaluation>.IndexKeys.Ascending(pe => pe.UserId))
        );

        // Candidates indexes
        await Candidates.Indexes.CreateOneAsync(
            new CreateIndexModel<Candidate>(Builders<Candidate>.IndexKeys.Ascending(c => c.Email),
                new CreateIndexOptions { Unique = false })
        );
        await Candidates.Indexes.CreateOneAsync(
            new CreateIndexModel<Candidate>(Builders<Candidate>.IndexKeys.Ascending(c => c.Status))
        );

        // LeaveBalance indexes
        await LeaveBalances.Indexes.CreateOneAsync(
            new CreateIndexModel<LeaveBalance>(Builders<LeaveBalance>.IndexKeys.Ascending(lb => lb.UserId))
        );

        // WorkSchedule indexes
        await WorkSchedules.Indexes.CreateOneAsync(
            new CreateIndexModel<WorkSchedule>(Builders<WorkSchedule>.IndexKeys.Ascending(ws => ws.Date))
        );

        // Payroll indexes
        await Payrolls.Indexes.CreateOneAsync(
            new CreateIndexModel<Payroll>(Builders<Payroll>.IndexKeys.Ascending(p => p.UserId))
        );
        await Payrolls.Indexes.CreateOneAsync(
            new CreateIndexModel<Payroll>(Builders<Payroll>.IndexKeys.Ascending(p => p.Period))
        );

        // ExpenseRequest indexes
        await ExpenseRequests.Indexes.CreateOneAsync(
            new CreateIndexModel<ExpenseRequest>(Builders<ExpenseRequest>.IndexKeys.Ascending(er => er.UserId))
        );
        await ExpenseRequests.Indexes.CreateOneAsync(
            new CreateIndexModel<ExpenseRequest>(Builders<ExpenseRequest>.IndexKeys.Ascending(er => er.Status))
        );

        // EmployeeShift indexes
        await EmployeeShifts.Indexes.CreateOneAsync(
            new CreateIndexModel<EmployeeShift>(Builders<EmployeeShift>.IndexKeys.Ascending(es => es.UserId))
        );
        await EmployeeShifts.Indexes.CreateOneAsync(
            new CreateIndexModel<EmployeeShift>(Builders<EmployeeShift>.IndexKeys.Ascending(es => es.Date))
        );

        // VisitorLog indexes
        await VisitorLogs.Indexes.CreateOneAsync(
            new CreateIndexModel<VisitorLog>(Builders<VisitorLog>.IndexKeys.Ascending(vl => vl.HostUserId))
        );
        await VisitorLogs.Indexes.CreateOneAsync(
            new CreateIndexModel<VisitorLog>(Builders<VisitorLog>.IndexKeys.Ascending(vl => vl.Status))
        );
    }
}
