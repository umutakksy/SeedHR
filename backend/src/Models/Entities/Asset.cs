using System;

namespace SeedHR.Backend.Models.Entities;

public class Asset : BaseEntity
{
    public string Type { get; set; } = null!; // Laptop, Phone, Monitor, License vb.
    public string Name { get; set; } = null!;
    public string Model { get; set; } = null!;
    public string SerialNumber { get; set; } = null!;
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public string Condition { get; set; } = "New"; // New, Good, Fair, Poor
    public string Status { get; set; } = "Available"; // Available, Assigned, Broken, Returned
    public string? CurrentAssigneeId { get; set; }
    public DateTime? AssignmentDate { get; set; }
    public string? Notes { get; set; }
}
