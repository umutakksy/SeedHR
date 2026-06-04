using System;
using System.Collections.Generic;

namespace SeedHR.Frontend.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
        public DateTime Timestamp { get; set; }

        public static ApiResponse<T> ErrorResponse(string message)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = new List<string> { message },
                Timestamp = DateTime.UtcNow
            };
        }
    }

    public class PaginatedResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? TurnstileToken { get; set; }
    }

    public class LoginResponse
    {
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public UserDto User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string IdentityNumber { get; set; } = null!;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string? PositionId { get; set; }
        public string? PositionTitle { get; set; }
        public string? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public DateTime? HireDate { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string RoleId { get; set; } = null!;
        public string RoleName { get; set; } = null!;
        public bool IsActive { get; set; }
        public string FullName => $"{FirstName} {LastName}";
    }

    public class CreateUserRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string IdentityNumber { get; set; } = null!;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? DepartmentId { get; set; }
        public string? PositionId { get; set; }
        public string? ManagerId { get; set; }
        public DateTime? HireDate { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string RoleId { get; set; } = null!;
    }

    public class UpdateUserRequest
    {
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;
        public string IdentityNumber { get; set; } = null!;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? DepartmentId { get; set; }
        public string? PositionId { get; set; }
        public string? ManagerId { get; set; }
        public DateTime? HireDate { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string RoleId { get; set; } = null!;
        public bool IsActive { get; set; }
    }

    public class DepartmentDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public int EmployeeCount { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateDepartmentRequest
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? ManagerId { get; set; }
    }

    public class UpdateDepartmentRequest
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? ManagerId { get; set; }
        public bool IsActive { get; set; }
    }

    public class PositionDto
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string DepartmentId { get; set; } = null!;
        public string DepartmentName { get; set; } = null!;
        public int EmployeeCount { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreatePositionRequest
    {
        public string Title { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string DepartmentId { get; set; } = null!;
    }

    public class UpdatePositionRequest
    {
        public string Title { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string DepartmentId { get; set; } = null!;
        public bool IsActive { get; set; }
    }

    public class LeaveRequestDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string LeaveTypeId { get; set; } = null!;
        public string LeaveTypeName { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRequested { get; set; }
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLeaveRequestRequest
    {
        public string LeaveTypeId { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRequested { get; set; }
        public string Reason { get; set; } = null!;
    }

    public class LeaveApprovalRequest
    {
        public string Status { get; set; } = null!; // Approved, Rejected
        public string? RejectionReason { get; set; }
    }

    public class LeaveBalanceDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string LeaveTypeId { get; set; } = null!;
        public string LeaveTypeName { get; set; } = null!;
        public int Year { get; set; }
        public int TotalDays { get; set; }
        public int UsedDays { get; set; }
        public int RemainingDays { get; set; }
        public double RemainingPercentage { get; set; }
    }

    public class LeaveTypeDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int DefaultDays { get; set; }
        public bool RequiresApproval { get; set; }
        public bool IsActive { get; set; }
    }

    public class AttendanceDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Date { get; set; } = null!;
        public string? CheckIn { get; set; }
        public string? CheckOut { get; set; }
        public string Status { get; set; } = null!;
        public double? TotalHoursWorked { get; set; }
        public string? Notes { get; set; }
    }

    public class DocumentDto
    {
        public string Id { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FileType { get; set; } = null!;
        public string DocumentType { get; set; } = null!;
        public long FileSize { get; set; }
        public string UserId { get; set; } = null!;
    }

    public class WorkScheduleDto
    {
        public string Id { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Type { get; set; } = null!;
        public string? Description { get; set; }
        public int DayOfWeek { get; set; }
    }

    public class CreateWorkScheduleRequest
    {
        public DateTime Date { get; set; }
        public string Type { get; set; } = null!;
        public string? Description { get; set; }
        public int DayOfWeek { get; set; }
    }

    public class CandidateDto
    {
        public string Id { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? CVPath { get; set; }
        public string? CoverLetter { get; set; }
        public DateTime AppliedDate { get; set; }
        public string Status { get; set; } = null!;
        public string FullName => $"{FirstName} {LastName}";
    }

    public class CreateCandidateRequest
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? CoverLetter { get; set; }
    }

    public class JobPostingDto
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Requirements { get; set; } = null!;
        public DateTime PostedDate { get; set; }
        public DateTime? ClosedDate { get; set; }
        public string Status { get; set; } = null!;
        public int NumberOfPositions { get; set; }
        public int ApplicationCount { get; set; }
    }

    public class CreateJobPostingRequest
    {
        public string PositionId { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Requirements { get; set; } = null!;
        public int NumberOfPositions { get; set; }
    }

    public class UpdateJobPostingRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Requirements { get; set; } = null!;
        public int NumberOfPositions { get; set; }
        public string Status { get; set; } = null!;
    }

    public class InterviewDto
    {
        public string Id { get; set; } = null!;
        public string CandidateName { get; set; } = null!;
        public string InterviewerName { get; set; } = null!;
        public string JobTitle { get; set; } = null!;
        public DateTime ScheduledDate { get; set; }
        public string Type { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Location { get; set; }
        public int? Rating { get; set; }
        public string? Feedback { get; set; }
        public string? Result { get; set; }
    }

    public class CreateInterviewRequest
    {
        public string CandidateId { get; set; } = null!;
        public string JobPostingId { get; set; } = null!;
        public DateTime ScheduledDate { get; set; }
        public string Type { get; set; } = null!;
        public string? Location { get; set; }
    }

    public class CompleteInterviewRequest
    {
        public int Rating { get; set; }
        public string? Feedback { get; set; }
        public string Result { get; set; } = null!;
    }

    public class AnnouncementDto
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? ImagePath { get; set; }
        public string CreatedBy { get; set; } = null!;
        public DateTime PublishedDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Status { get; set; } = null!;
        public string? Category { get; set; }
    }

    public class CreateAnnouncementRequest
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? ImagePath { get; set; }
        public string? Category { get; set; }
    }

    public class UpdateAnnouncementRequest
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string? ImagePath { get; set; }
        public string? Category { get; set; }
    }

    public class DashboardStatisticsDto
    {
        public int TotalEmployees { get; set; }
        public int NewEmployeesThisMonth { get; set; }
        public int PendingLeaveRequests { get; set; }
        public int OpenPositions { get; set; }
        public int ActiveAnnouncements { get; set; }
        public int ActiveLeaveRequests => PendingLeaveRequests;
        public int OpenJobPostings => OpenPositions;
        public double AveragePerformanceScore { get; set; }
        public int AttendanceRateToday { get; set; }
        public List<UpcomingBirthdayDto> UpcomingBirthdays { get; set; } = new();
        public List<UpcomingLeaveDto> UpcomingLeaves { get; set; } = new();
        public List<AnnouncementDto> RecentAnnouncements { get; set; } = new();
    }

    public class UpcomingBirthdayDto
    {
        public string EmployeeName { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public int DaysUntilBirthday { get; set; }
    }

    public class UpcomingLeaveDto
    {
        public string EmployeeName { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Days { get; set; }
        public string LeaveType { get; set; } = null!;
    }

    public class PerformanceGoalDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string EmployeeName { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime TargetDate { get; set; }
        public string Status { get; set; } = null!; // Pending, InProgress, Achieved, NotAchieved
        public int Weight { get; set; }
    }

    public class CreatePerformanceGoalRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime TargetDate { get; set; }
        public int Weight { get; set; }
        public string Status { get; set; } = "Pending";
    }

    public class PerformanceEvaluationDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string EmployeeName { get; set; } = null!;
        public string EvaluatorId { get; set; } = null!;
        public string EvaluatorName { get; set; } = null!;
        public DateTime EvaluationDate { get; set; }
        public double Score { get; set; }
        public string Comments { get; set; } = null!;
        public string Period { get; set; } = null!;
    }

    public class CreatePerformanceEvaluationRequest
    {
        public string UserId { get; set; } = null!;
        public double Score { get; set; }
        public string Comments { get; set; } = null!;
        public string Period { get; set; } = null!;
    }

    public class RoleDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
    }

    public class NotificationDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }

    public class LogFileDto
    {
        public string FileName { get; set; } = null!;
        public long SizeInBytes { get; set; }
        public DateTime LastModified { get; set; }
        public string SizeFormatted { get; set; } = null!;
    }

    public class CvScoreResult
    {
        public string CandidateId { get; set; } = null!;
        public string CandidateName { get; set; } = null!;
        public int Score { get; set; }
        public string Summary { get; set; } = null!;
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public string Recommendation { get; set; } = null!;
        public string? JobTitle { get; set; }
        public string? JobRequirements { get; set; }
    }
}
