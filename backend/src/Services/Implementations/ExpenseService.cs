using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Implementations;

public class ExpenseService : IExpenseService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public ExpenseService(IUnitOfWork unitOfWork, INotificationService notificationService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<ExpenseRequestDto> CreateExpenseRequestAsync(string userId, CreateExpenseRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var expense = new ExpenseRequest
        {
            UserId = userId,
            Amount = request.Amount,
            Currency = request.Currency,
            Category = request.Category,
            Description = request.Description,
            ReceiptUrl = request.ReceiptUrl,
            Status = "Pending"
        };

        var created = await _unitOfWork.ExpenseRequests.AddAsync(expense);
        await _unitOfWork.SaveChangesAsync();

        // Notify HR and Manager
        var adminsAndHr = await _unitOfWork.Users.FindAsync(u => u.RoleId == "role_admin" || u.RoleId == "role_hr");
        foreach (var admin in adminsAndHr)
        {
            await _notificationService.CreateNotificationAsync(
                admin.Id,
                "Yeni Masraf Talebi",
                $"{user.FullName} yeni bir masraf talebi sundu: {request.Amount} {request.Currency}",
                "Expense",
                created.Id,
                "Expense"
            );
        }

        var dto = _mapper.Map<ExpenseRequestDto>(created);
        dto.UserFullName = user.FullName;
        return dto;
    }

    public async Task<ExpenseRequestDto> GetExpenseByIdAsync(string id)
    {
        var expense = await _unitOfWork.ExpenseRequests.GetByIdAsync(id)
            ?? throw new NotFoundException($"Expense request with ID {id} not found");

        var user = await _unitOfWork.Users.GetByIdAsync(expense.UserId);
        var approver = string.IsNullOrEmpty(expense.ApprovedBy) ? null : await _unitOfWork.Users.GetByIdAsync(expense.ApprovedBy);

        var dto = _mapper.Map<ExpenseRequestDto>(expense);
        dto.UserFullName = user?.FullName ?? "Unknown User";
        dto.ApprovedByName = approver?.FullName;
        return dto;
    }

    public async Task<IEnumerable<ExpenseRequestDto>> GetExpensesByUserAsync(string userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var list = await _unitOfWork.ExpenseRequests.GetExpensesByUserAsync(userId);
        var dtos = new List<ExpenseRequestDto>();
        foreach (var ex in list)
        {
            var approver = string.IsNullOrEmpty(ex.ApprovedBy) ? null : await _unitOfWork.Users.GetByIdAsync(ex.ApprovedBy);
            var dto = _mapper.Map<ExpenseRequestDto>(ex);
            dto.UserFullName = user.FullName;
            dto.ApprovedByName = approver?.FullName;
            dtos.Add(dto);
        }
        return dtos;
    }

    public async Task<IEnumerable<ExpenseRequestDto>> GetAllExpensesAsync()
    {
        var list = await _unitOfWork.ExpenseRequests.GetAllAsync();
        var dtos = new List<ExpenseRequestDto>();
        foreach (var ex in list)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(ex.UserId);
            var approver = string.IsNullOrEmpty(ex.ApprovedBy) ? null : await _unitOfWork.Users.GetByIdAsync(ex.ApprovedBy);
            var dto = _mapper.Map<ExpenseRequestDto>(ex);
            dto.UserFullName = user?.FullName ?? "Unknown User";
            dto.ApprovedByName = approver?.FullName;
            dtos.Add(dto);
        }
        return dtos;
    }

    public async Task<ExpenseRequestDto> ApproveExpenseAsync(string id, string approvedBy)
    {
        var expense = await _unitOfWork.ExpenseRequests.GetByIdAsync(id)
            ?? throw new NotFoundException($"Expense request with ID {id} not found");

        expense.Status = "Approved";
        expense.ApprovedBy = approvedBy;
        expense.ApprovedDate = DateTime.UtcNow;

        await _unitOfWork.ExpenseRequests.UpdateAsync(expense);
        await _unitOfWork.SaveChangesAsync();

        // Notify User
        var approver = await _unitOfWork.Users.GetByIdAsync(approvedBy);
        await _notificationService.CreateNotificationAsync(
            expense.UserId,
            "Masraf Talebiniz Onaylandı",
            $"Girdiğiniz {expense.Amount} {expense.Currency} tutarındaki masraf talebi onaylandı.",
            "Success",
            expense.Id,
            "Expense"
        );

        var user = await _unitOfWork.Users.GetByIdAsync(expense.UserId);
        var dto = _mapper.Map<ExpenseRequestDto>(expense);
        dto.UserFullName = user?.FullName ?? "Unknown User";
        dto.ApprovedByName = approver?.FullName;
        return dto;
    }

    public async Task<ExpenseRequestDto> RejectExpenseAsync(string id, string approvedBy, string reason)
    {
        var expense = await _unitOfWork.ExpenseRequests.GetByIdAsync(id)
            ?? throw new NotFoundException($"Expense request with ID {id} not found");

        expense.Status = "Rejected";
        expense.ApprovedBy = approvedBy;
        expense.ApprovedDate = DateTime.UtcNow;
        expense.RejectionReason = reason;

        await _unitOfWork.ExpenseRequests.UpdateAsync(expense);
        await _unitOfWork.SaveChangesAsync();

        // Notify User
        var approver = await _unitOfWork.Users.GetByIdAsync(approvedBy);
        await _notificationService.CreateNotificationAsync(
            expense.UserId,
            "Masraf Talebiniz Reddedildi",
            $"Girdiğiniz {expense.Amount} {expense.Currency} tutarındaki masraf talebi reddedildi. Gerekçe: {reason}",
            "Error",
            expense.Id,
            "Expense"
        );

        var user = await _unitOfWork.Users.GetByIdAsync(expense.UserId);
        var dto = _mapper.Map<ExpenseRequestDto>(expense);
        dto.UserFullName = user?.FullName ?? "Unknown User";
        dto.ApprovedByName = approver?.FullName;
        return dto;
    }
}
