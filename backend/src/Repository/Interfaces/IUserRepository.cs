namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetByDepartmentAsync(string departmentId);
    Task<IEnumerable<User>> GetByPositionAsync(string positionId);
    Task<IEnumerable<User>> GetByManagerAsync(string managerId);
    Task<IEnumerable<User>> GetEmployeesByRoleAsync(string roleId);
    Task<IEnumerable<User>> GetUpcomingBirthdaysAsync(int days = 30);
}
