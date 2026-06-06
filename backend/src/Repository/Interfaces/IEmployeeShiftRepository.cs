using SeedHR.Backend.Models.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IEmployeeShiftRepository : IRepository<EmployeeShift>
{
    Task<IEnumerable<EmployeeShift>> GetShiftsByUserAsync(string userId);
    Task<IEnumerable<EmployeeShift>> GetShiftsByDateRangeAsync(DateTime start, DateTime end);
    Task<EmployeeShift?> GetShiftByUserAndDateAsync(string userId, DateTime date);
}
