namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class LeaveApprovalRequestValidator : AbstractValidator<LeaveApprovalRequest>
{
    public LeaveApprovalRequestValidator()
    {
        RuleFor(x => x.LeaveRequestId)
            .NotEmpty().WithMessage("Leave request ID is required");

        RuleFor(x => x.RejectionReason)
            .NotEmpty().WithMessage("Rejection reason is required")
            .Length(5, 500).WithMessage("Rejection reason must be between 5 and 500 characters")
            .When(x => !x.Approve);
    }
}
