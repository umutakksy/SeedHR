using System;

namespace SeedHR.Backend.Models.Entities;

public class Payroll : BaseEntity
{
    public string UserId { get; set; } = null!;
    public string Period { get; set; } = null!; // e.g., "2026-06"
    public decimal BaseSalary { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal OvertimeRate { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public decimal TaxAmount { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Approved, Paid
    public DateTime? PaymentDate { get; set; }
    public string? Notes { get; set; }
}
