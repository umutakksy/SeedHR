using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

namespace SeedHR.Backend.Utils.Mappers;

public class FinanceMappingProfile : Profile
{
    public FinanceMappingProfile()
    {
        CreateMap<Payroll, PayrollDto>();
        CreateMap<CreatePayrollRequest, Payroll>();

        CreateMap<ExpenseRequest, ExpenseRequestDto>();
        CreateMap<CreateExpenseRequest, ExpenseRequest>();

        CreateMap<EmployeeShift, EmployeeShiftDto>();
        CreateMap<CreateEmployeeShiftRequest, EmployeeShift>();

        CreateMap<VisitorLog, VisitorLogDto>();
        CreateMap<CreateVisitorLogRequest, VisitorLog>();
    }
}
