namespace SeedHR.Backend.Repository.Implementations;

using SeedHR.Backend.Data;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;

public class UserRepository : MongoRepository<User>, IUserRepository
{
    public UserRepository(IMongoDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<User>> GetByDepartmentAsync(string departmentId)
    {
        return await FindAsync(u => u.DepartmentId == departmentId);
    }

    public async Task<IEnumerable<User>> GetByPositionAsync(string positionId)
    {
        return await FindAsync(u => u.PositionId == positionId);
    }

    public async Task<IEnumerable<User>> GetByManagerAsync(string managerId)
    {
        return await FindAsync(u => u.ManagerId == managerId);
    }

    public async Task<IEnumerable<User>> GetEmployeesByRoleAsync(string roleId)
    {
        return await FindAsync(u => u.RoleId == roleId);
    }

    public async Task<IEnumerable<User>> GetUpcomingBirthdaysAsync(int days = 30)
    {
        var today = DateTime.UtcNow;
        var futureDate = today.AddDays(days);
        var months = new List<int> { today.Month, futureDate.Month };

        // Query only users born in the current month or the next month to drastically reduce memory usage
        var users = await FindAsync(u => months.Contains(u.DateOfBirth.Month));

        return users.Where(u =>
        {
            var nextBirthday = new DateTime(today.Year, u.DateOfBirth.Month, u.DateOfBirth.Day);
            if (nextBirthday < today)
                nextBirthday = nextBirthday.AddYears(1);

            return nextBirthday >= today && nextBirthday <= futureDate;
        }).OrderBy(u => new DateTime(today.Year, u.DateOfBirth.Month, u.DateOfBirth.Day));
    }
}
