using SeedHR.Backend.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface IEmployeeShiftService
{
    Task<EmployeeShiftDto> AssignShiftAsync(CreateEmployeeShiftRequest request);
    Task<IEnumerable<EmployeeShiftDto>> GetShiftsByUserAsync(string userId);
    Task<IEnumerable<EmployeeShiftDto>> GetShiftsByDateRangeAsync(DateTime start, DateTime end);
}
