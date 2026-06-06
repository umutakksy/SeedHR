using System;

namespace SeedHR.Backend.Models.DTOs;

public class AssetDto
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Model { get; set; } = null!;
    public string SerialNumber { get; set; } = null!;
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public string Condition { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? CurrentAssigneeId { get; set; }
    public string? CurrentAssigneeName { get; set; }
    public DateTime? AssignmentDate { get; set; }
    public string? Notes { get; set; }
}
