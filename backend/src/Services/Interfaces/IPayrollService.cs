using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface IPayrollService
{
    Task<PayrollDto> CalculatePayrollAsync(CreatePayrollRequest request);
    Task<PayrollDto> GetPayrollByIdAsync(string id);
    Task<IEnumerable<PayrollDto>> GetPayrollsByUserAsync(string userId);
    Task<IEnumerable<PayrollDto>> GetPayrollsByPeriodAsync(string period);
    Task<PayrollDto> UpdatePayrollStatusAsync(string id, string status);
}
