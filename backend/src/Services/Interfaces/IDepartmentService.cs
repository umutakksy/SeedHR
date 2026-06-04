namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IDepartmentService
{
    Task<DepartmentDto> GetDepartmentByIdAsync(string id);
    Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request);
    Task<DepartmentDto> UpdateDepartmentAsync(string id, UpdateDepartmentRequest request);
    Task<bool> DeleteDepartmentAsync(string id);
}
