namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IPositionService
{
    Task<PositionDto> GetPositionByIdAsync(string id);
    Task<IEnumerable<PositionDto>> GetAllPositionsAsync();
    Task<IEnumerable<PositionDto>> GetPositionsByDepartmentAsync(string departmentId);
    Task<PositionDto> CreatePositionAsync(CreatePositionRequest request);
    Task<PositionDto> UpdatePositionAsync(string id, UpdatePositionRequest request);
    Task<bool> DeletePositionAsync(string id);
}
