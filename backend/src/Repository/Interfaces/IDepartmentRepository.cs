namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface IDepartmentRepository : IRepository<Department>
{
    Task<Department?> GetByCodeAsync(string code);
    Task<Department?> GetWithEmployeesAsync(string id);
    Task<IEnumerable<Department>> GetByManagerAsync(string managerId);
}
