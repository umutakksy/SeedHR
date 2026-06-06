using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IPayrollRepository : IRepository<Payroll>
{
    Task<IEnumerable<Payroll>> GetPayrollsByUserAsync(string userId);
    Task<Payroll?> GetPayrollByUserAndPeriodAsync(string userId, string period);
    Task<IEnumerable<Payroll>> GetPayrollsByPeriodAsync(string period);
}
