using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface IAssetService
{
    Task<AssetDto> CreateAssetAsync(CreateAssetRequest request);
    Task<AssetDto> GetAssetByIdAsync(string id);
    Task<IEnumerable<AssetDto>> GetAllAssetsAsync(string? type = null, string? status = null);
    Task<AssetDto> UpdateAssetAsync(string id, CreateAssetRequest request);
    Task<bool> DeleteAssetAsync(string id);
    Task<AssetDto> AllocateAssetAsync(string assetId, AllocateAssetRequest request);
    Task<AssetDto> ReturnAssetAsync(string assetId, string? condition = null);
    Task<IEnumerable<AssetDto>> GetAssetsByUserAsync(string userId);
    Task<IEnumerable<AssetReportDto>> GetAssetReportByDepartmentAsync();
    Task<AssetInventoryDto> GetAssetInventorySummaryAsync();
}
