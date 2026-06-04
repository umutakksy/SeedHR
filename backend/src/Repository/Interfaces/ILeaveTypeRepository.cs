namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface ILeaveTypeRepository : IRepository<LeaveType>
{
    Task<LeaveType?> GetByCodeAsync(string code);
}
