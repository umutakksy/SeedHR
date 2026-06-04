namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class UpdateDepartmentRequestValidator : AbstractValidator<UpdateDepartmentRequest>
{
    public UpdateDepartmentRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Department name is required")
            .Length(2, 100).WithMessage("Department name must be between 2 and 100 characters");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Department code is required")
            .Length(2, 20).WithMessage("Department code must be between 2 and 20 characters")
            .Matches(@"^[A-Z0-9]+$").WithMessage("Department code must contain only uppercase letters and digits");

        RuleFor(x => x.Description)
            .Length(0, 500).WithMessage("Description must not exceed 500 characters");
    }
}
