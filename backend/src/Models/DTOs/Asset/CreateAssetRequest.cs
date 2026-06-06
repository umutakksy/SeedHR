using System;

namespace SeedHR.Backend.Models.DTOs;

public class CreateAssetRequest
{
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Model { get; set; } = null!;
    public string SerialNumber { get; set; } = null!;
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public string Condition { get; set; } = "New"; // New, Good, Fair, Poor
    public string? Notes { get; set; }
}
