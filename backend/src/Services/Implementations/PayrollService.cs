using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Implementations;

public class PayrollService : IPayrollService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PayrollService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PayrollDto> CalculatePayrollAsync(CreatePayrollRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId)
            ?? throw new NotFoundException($"User with ID {request.UserId} not found");

        // Simple check for existing payroll in period
        var existing = await _unitOfWork.Payrolls.GetPayrollByUserAndPeriodAsync(request.UserId, request.Period);
        if (existing != null)
        {
            // Update the existing instead of throwing to be user friendly
            await _unitOfWork.Payrolls.DeleteAsync(existing.Id);
        }

        // Determine base salary dynamically by user or role, with fallback
        decimal baseSalary = user.BaseSalary;
        if (baseSalary <= 0)
        {
            if (user.RoleId == "role_admin") baseSalary = 120000;
            else if (user.RoleId == "role_manager") baseSalary = 75000;
            else if (user.RoleId == "role_hr") baseSalary = 60000;
            else baseSalary = 45000;
        }

        decimal hourlyRate = baseSalary / 225; // Standard working hours per month
        decimal overtimeRate = Math.Round(hourlyRate * 1.5m, 2);
        decimal overtimePay = Math.Round(request.OvertimeHours * overtimeRate, 2);

        decimal grossSalary = baseSalary + overtimePay + request.Bonus;
        decimal taxAmount = Math.Round(grossSalary * 0.15m, 2); // 15% flat rate
        decimal netSalary = grossSalary - taxAmount - request.Deductions;

        var payroll = new Payroll
        {
            UserId = request.UserId,
            Period = request.Period,
            BaseSalary = baseSalary,
            OvertimeHours = request.OvertimeHours,
            OvertimeRate = overtimeRate,
            Bonus = request.Bonus,
            Deductions = request.Deductions,
            GrossSalary = grossSalary,
            NetSalary = netSalary,
            TaxAmount = taxAmount,
            Status = "Draft",
            Notes = request.Notes
        };

        var created = await _unitOfWork.Payrolls.AddAsync(payroll);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<PayrollDto>(created);
        dto.UserFullName = user.FullName;
        return dto;
    }

    public async Task<PayrollDto> GetPayrollByIdAsync(string id)
    {
        var payroll = await _unitOfWork.Payrolls.GetByIdAsync(id)
            ?? throw new NotFoundException($"Payroll log with ID {id} not found");

        var user = await _unitOfWork.Users.GetByIdAsync(payroll.UserId);
        var dto = _mapper.Map<PayrollDto>(payroll);
        dto.UserFullName = user?.FullName ?? "Unknown User";
        return dto;
    }

    public async Task<IEnumerable<PayrollDto>> GetPayrollsByUserAsync(string userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var list = await _unitOfWork.Payrolls.GetPayrollsByUserAsync(userId);
        var dtos = new List<PayrollDto>();
        foreach (var p in list)
        {
            var dto = _mapper.Map<PayrollDto>(p);
            dto.UserFullName = user.FullName;
            dtos.Add(dto);
        }
        return dtos;
    }

    public async Task<IEnumerable<PayrollDto>> GetPayrollsByPeriodAsync(string period)
    {
        var list = (await _unitOfWork.Payrolls.GetPayrollsByPeriodAsync(period)).ToList();
        var dtos = new List<PayrollDto>();
        if (list.Any())
        {
            var userIds = list.Select(p => p.UserId).ToHashSet();
            var users = (await _unitOfWork.Users.FindAsync(u => userIds.Contains(u.Id)))
                .ToDictionary(u => u.Id);

            foreach (var p in list)
            {
                var dto = _mapper.Map<PayrollDto>(p);
                dto.UserFullName = users.TryGetValue(p.UserId, out var user) ? user.FullName : "Unknown User";
                dtos.Add(dto);
            }
        }
        return dtos;
    }

    public async Task<PaginatedResponse<PayrollDto>> GetPagedPayrollsByPeriodAsync(string period, int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Payrolls.GetPagedAsync(p => p.Period == period, page, pageSize, p => p.CreatedAt, true);
        var itemList = items.ToList();
        var dtos = new List<PayrollDto>();

        if (itemList.Any())
        {
            var userIds = itemList.Select(p => p.UserId).ToHashSet();
            var users = (await _unitOfWork.Users.FindAsync(u => userIds.Contains(u.Id)))
                .ToDictionary(u => u.Id);

            foreach (var p in itemList)
            {
                var dto = _mapper.Map<PayrollDto>(p);
                dto.UserFullName = users.TryGetValue(p.UserId, out var user) ? user.FullName : "Unknown User";
                dtos.Add(dto);
            }
        }

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PaginatedResponse<PayrollDto>
        {
            Items = dtos,
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<PayrollDto> UpdatePayrollStatusAsync(string id, string status)
    {
        var payroll = await _unitOfWork.Payrolls.GetByIdAsync(id)
            ?? throw new NotFoundException($"Payroll with ID {id} not found");

        payroll.Status = status;
        if (status == "Paid")
        {
            payroll.PaymentDate = DateTime.UtcNow;
        }

        await _unitOfWork.Payrolls.UpdateAsync(payroll);
        await _unitOfWork.SaveChangesAsync();

        var user = await _unitOfWork.Users.GetByIdAsync(payroll.UserId);
        var dto = _mapper.Map<PayrollDto>(payroll);
        dto.UserFullName = user?.FullName ?? "Unknown User";
        return dto;
    }
}
