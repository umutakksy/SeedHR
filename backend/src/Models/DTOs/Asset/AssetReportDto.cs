using System.Collections.Generic;

namespace SeedHR.Backend.Models.DTOs;

public class AssetReportDto
{
    public string DepartmentId { get; set; } = null!;
    public string DepartmentName { get; set; } = null!;
    public int TotalAssetsAllocated { get; set; }
    public decimal TotalValue { get; set; }
    public List<AssetDto> AllocatedAssets { get; set; } = new();
}
