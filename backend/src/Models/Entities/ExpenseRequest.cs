using System;

namespace SeedHR.Backend.Models.Entities;

public class ExpenseRequest : BaseEntity
{
    public string UserId { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY"; // TRY, USD, EUR
    public string Category { get; set; } = "Other"; // Travel, Meals, Office, Other
    public string Description { get; set; } = null!;
    public string? ReceiptUrl { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectionReason { get; set; }
}
