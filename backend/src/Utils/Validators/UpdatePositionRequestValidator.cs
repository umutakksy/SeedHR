namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class UpdatePositionRequestValidator : AbstractValidator<UpdatePositionRequest>
{
    public UpdatePositionRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Position title is required")
            .Length(2, 100).WithMessage("Position title must be between 2 and 100 characters");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Position code is required")
            .Length(2, 20).WithMessage("Position code must be between 2 and 20 characters")
            .Matches(@"^[A-Z0-9]+$").WithMessage("Position code must contain only uppercase letters and digits");

        RuleFor(x => x.Description)
            .Length(0, 500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.DepartmentId)
            .NotEmpty().WithMessage("Department ID is required");
    }
}
