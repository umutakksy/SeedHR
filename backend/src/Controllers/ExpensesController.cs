using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ExpenseRequestDto>>>> GetAllExpenses()
    {
        var list = await _expenseService.GetAllExpensesAsync();
        return Ok(ApiResponse<IEnumerable<ExpenseRequestDto>>.SuccessResponse(list, "Expenses retrieved successfully"));
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ExpenseRequestDto>>>> GetUserExpenses(string userId)
    {
        var list = await _expenseService.GetExpensesByUserAsync(userId);
        return Ok(ApiResponse<IEnumerable<ExpenseRequestDto>>.SuccessResponse(list, "User expenses retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExpenseRequestDto>>> GetExpenseById(string id)
    {
        var expense = await _expenseService.GetExpenseByIdAsync(id);
        return Ok(ApiResponse<ExpenseRequestDto>.SuccessResponse(expense, "Expense retrieved successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExpenseRequestDto>>> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<ExpenseRequestDto>.ErrorResponse("Invalid input"));

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value 
                     ?? "user_employee";

        var expense = await _expenseService.CreateExpenseRequestAsync(userId, request);
        return Created("", ApiResponse<ExpenseRequestDto>.SuccessResponse(expense, "Expense request submitted successfully"));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<ExpenseRequestDto>>> ApproveExpense(string id)
    {
        var approvedBy = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? User.FindFirst("sub")?.Value 
                         ?? "user_admin";

        var expense = await _expenseService.ApproveExpenseAsync(id, approvedBy);
        return Ok(ApiResponse<ExpenseRequestDto>.SuccessResponse(expense, "Expense approved successfully"));
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<ExpenseRequestDto>>> RejectExpense(string id, [FromBody] ApproveExpenseRequest request)
    {
        var approvedBy = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? User.FindFirst("sub")?.Value 
                         ?? "user_admin";

        var reason = request.RejectionReason ?? "Gerekçe belirtilmedi";
        var expense = await _expenseService.RejectExpenseAsync(id, approvedBy, reason);
        return Ok(ApiResponse<ExpenseRequestDto>.SuccessResponse(expense, "Expense request rejected"));
    }
}
