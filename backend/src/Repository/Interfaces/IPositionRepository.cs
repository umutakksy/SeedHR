namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface IPositionRepository : IRepository<Position>
{
    Task<Position?> GetByCodeAsync(string code);
    Task<Position?> GetWithEmployeesAsync(string id);
    Task<IEnumerable<Position>> GetByDepartmentAsync(string departmentId);
}
