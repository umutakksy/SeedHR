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
    }
}
