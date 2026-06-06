using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class AssetInventoryDto
{
    public int TotalAssets { get; set; }
    public int AvailableAssets { get; set; }
    public int AssignedAssets { get; set; }
    public int BrokenAssets { get; set; }
    public int ReturnedAssets { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public Dictionary<string, int> CountByType { get; set; } = new();
}
