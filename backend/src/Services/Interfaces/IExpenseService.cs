using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface IExpenseService
{
    Task<ExpenseRequestDto> CreateExpenseRequestAsync(string userId, CreateExpenseRequest request);
    Task<ExpenseRequestDto> GetExpenseByIdAsync(string id);
    Task<IEnumerable<ExpenseRequestDto>> GetExpensesByUserAsync(string userId);
    Task<IEnumerable<ExpenseRequestDto>> GetAllExpensesAsync();
    Task<ExpenseRequestDto> ApproveExpenseAsync(string id, string approvedBy);
    Task<ExpenseRequestDto> RejectExpenseAsync(string id, string approvedBy, string reason);
}
