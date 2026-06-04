namespace SeedHR.Backend.Data;

using MongoDB.Driver;
using SeedHR.Backend.Models.Entities;

public interface IMongoDbContext
{
    IMongoCollection<User> Users { get; }
    IMongoCollection<Role> Roles { get; }
    IMongoCollection<Permission> Permissions { get; }
    IMongoCollection<Department> Departments { get; }
    IMongoCollection<Position> Positions { get; }
    IMongoCollection<Document> Documents { get; }
    IMongoCollection<LeaveType> LeaveTypes { get; }
    IMongoCollection<LeaveRequest> LeaveRequests { get; }
    IMongoCollection<LeaveBalance> LeaveBalances { get; }
    IMongoCollection<WorkSchedule> WorkSchedules { get; }
    IMongoCollection<Attendance> Attendances { get; }
    IMongoCollection<PerformanceGoal> PerformanceGoals { get; }
    IMongoCollection<PerformanceEvaluation> PerformanceEvaluations { get; }
    IMongoCollection<JobPosting> JobPostings { get; }
    IMongoCollection<Candidate> Candidates { get; }
    IMongoCollection<CandidateApplication> CandidateApplications { get; }
    IMongoCollection<Interview> Interviews { get; }
    IMongoCollection<Announcement> Announcements { get; }
    IMongoCollection<Notification> Notifications { get; }

    Task CreateIndexesAsync();
}
