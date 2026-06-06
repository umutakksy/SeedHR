using System;

namespace SeedHR.Backend.Models.DTOs;

public class CourseDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!; // Online, Classroom
    public int DurationHours { get; set; }
    public string Provider { get; set; } = null!;
    public string? DocumentUrl { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCourseRequest
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!; // Online, Classroom
    public int DurationHours { get; set; }
    public string Provider { get; set; } = null!;
    public string? DocumentUrl { get; set; }
}

public class CourseAssignmentDto
{
    public string Id { get; set; } = null!;
    public string CourseId { get; set; } = null!;
    public string CourseTitle { get; set; } = null!;
    public string CourseDescription { get; set; } = null!;
    public string CourseType { get; set; } = null!;
    public int CourseDurationHours { get; set; }
    public string UserId { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public string AssignedBy { get; set; } = null!;
    public string AssignedByName { get; set; } = null!;
    public DateTime AssignedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = null!; // Assigned, Completed
    public string? CertificateUrl { get; set; }
    public DateTime? CertificateExpiryDate { get; set; }
}

public class AssignCourseRequest
{
    public string CourseId { get; set; } = null!;
    public string UserId { get; set; } = null!;
}
