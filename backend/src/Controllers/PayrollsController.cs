using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollsController : ControllerBase
{
    private readonly IPayrollService _payrollService;

    public PayrollsController(IPayrollService payrollService)
    {
        _payrollService = payrollService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PayrollDto>>>> GetUserPayrolls(string userId)
    {
        var list = await _payrollService.GetPayrollsByUserAsync(userId);
        return Ok(ApiResponse<IEnumerable<PayrollDto>>.SuccessResponse(list, "Payrolls retrieved successfully"));
    }

    [HttpGet("period/{period}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<PayrollDto>>>> GetPeriodPayrolls(string period, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var list = await _payrollService.GetPagedPayrollsByPeriodAsync(period, page, pageSize);
        return Ok(ApiResponse<PaginatedResponse<PayrollDto>>.SuccessResponse(list, "Period payrolls retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PayrollDto>>> GetPayrollById(string id)
    {
        var payroll = await _payrollService.GetPayrollByIdAsync(id);
        return Ok(ApiResponse<PayrollDto>.SuccessResponse(payroll, "Payroll retrieved successfully"));
    }

    [HttpPost("calculate")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<PayrollDto>>> CalculatePayroll([FromBody] CreatePayrollRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PayrollDto>.ErrorResponse("Invalid input"));

        var payroll = await _payrollService.CalculatePayrollAsync(request);
        return Created("", ApiResponse<PayrollDto>.SuccessResponse(payroll, "Payroll calculated successfully"));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<PayrollDto>>> UpdateStatus(string id, [FromBody] UpdatePayrollStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<PayrollDto>.ErrorResponse("Invalid input"));

        var payroll = await _payrollService.UpdatePayrollStatusAsync(id, request.Status);
        return Ok(ApiResponse<PayrollDto>.SuccessResponse(payroll, $"Payroll status updated to {request.Status}"));
    }
}
