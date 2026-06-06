using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IExpenseRequestRepository : IRepository<ExpenseRequest>
{
    Task<IEnumerable<ExpenseRequest>> GetExpensesByUserAsync(string userId);
    Task<IEnumerable<ExpenseRequest>> GetPendingExpensesAsync();
}
