using System;

namespace SeedHR.Backend.Models.Entities;

public class AssetAllocation : BaseEntity
{
    public string AssetId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string? DepartmentId { get; set; }
    public DateTime AllocationDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string ConditionOnAllocation { get; set; } = null!;
    public string? ConditionOnReturn { get; set; }
    public string? SignatureUrl { get; set; } // İmza base64/dosya linki
}
