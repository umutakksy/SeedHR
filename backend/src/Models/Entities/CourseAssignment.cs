namespace SeedHR.Backend.Models.Entities;

using System;

public class CourseAssignment : BaseEntity
{
    public string CourseId { get; set; } = null!;
    public Course? Course { get; set; }
    public string UserId { get; set; } = null!;
    public User? User { get; set; }
    public string AssignedBy { get; set; } = null!;
    public DateTime AssignedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = null!; // Assigned, Completed
    public string? CertificateUrl { get; set; }
    public DateTime? CertificateExpiryDate { get; set; }
}
