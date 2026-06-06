using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IAssetAllocationRepository : IRepository<AssetAllocation>
{
    Task<IEnumerable<AssetAllocation>> GetAllocationsByUserAsync(string userId);
    Task<IEnumerable<AssetAllocation>> GetAllocationsByAssetAsync(string assetId);
    Task<AssetAllocation?> GetActiveAllocationAsync(string assetId);
}
