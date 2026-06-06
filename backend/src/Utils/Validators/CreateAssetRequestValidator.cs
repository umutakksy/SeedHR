using FluentValidation;
using SeedHR.Backend.Models.DTOs;

namespace SeedHR.Backend.Utils.Validators;

public class CreateAssetRequestValidator : AbstractValidator<CreateAssetRequest>
{
    public CreateAssetRequestValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Asset type is required")
            .MaximumLength(50).WithMessage("Asset type cannot exceed 50 characters");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Asset name is required")
            .MaximumLength(100).WithMessage("Asset name cannot exceed 100 characters");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Asset model is required")
            .MaximumLength(100).WithMessage("Asset model cannot exceed 100 characters");

        RuleFor(x => x.SerialNumber)
            .NotEmpty().WithMessage("Serial number is required")
            .MaximumLength(100).WithMessage("Serial number cannot exceed 100 characters");

        RuleFor(x => x.PurchaseDate)
            .NotEmpty().WithMessage("Purchase date is required");

        RuleFor(x => x.PurchasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Purchase price cannot be negative");

        RuleFor(x => x.Condition)
            .NotEmpty().WithMessage("Condition is required")
            .Must(c => c == "New" || c == "Good" || c == "Fair" || c == "Poor")
            .WithMessage("Condition must be 'New', 'Good', 'Fair', or 'Poor'");
    }
}
