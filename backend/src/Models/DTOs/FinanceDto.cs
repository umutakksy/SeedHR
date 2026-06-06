using System;

namespace SeedHR.Backend.Models.DTOs;

public class PayrollDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public string Period { get; set; } = null!;
    public decimal BaseSalary { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal OvertimeRate { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public decimal TaxAmount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? PaymentDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePayrollRequest
{
    public string UserId { get; set; } = null!;
    public string Period { get; set; } = null!;
    public decimal OvertimeHours { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public string? Notes { get; set; }
}

public class UpdatePayrollStatusRequest
{
    public string Status { get; set; } = null!; // Approved, Paid
}

public class ExpenseRequestDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? ReceiptUrl { get; set; }
    public string Status { get; set; } = null!;
    public string? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseRequest
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string Category { get; set; } = "Other";
    public string Description { get; set; } = null!;
    public string? ReceiptUrl { get; set; }
}

public class ApproveExpenseRequest
{
    public string? RejectionReason { get; set; } // If rejecting
}
