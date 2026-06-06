using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IAssetRepository : IRepository<Asset>
{
    Task<IEnumerable<Asset>> GetAvailableAssetsAsync();
    Task<IEnumerable<Asset>> GetAssetsByUserAsync(string userId);
    Task<IEnumerable<Asset>> GetAssetsByStatusAsync(string status);
}
