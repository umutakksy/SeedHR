namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class CreateJobPostingRequestValidator : AbstractValidator<CreateJobPostingRequest>
{
    public CreateJobPostingRequestValidator()
    {
        RuleFor(x => x.PositionId)
            .NotEmpty().WithMessage("Position ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Job title is required")
            .Length(5, 150).WithMessage("Job title must be between 5 and 150 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Job description is required")
            .Length(20, 2000).WithMessage("Job description must be between 20 and 2000 characters");

        RuleFor(x => x.Requirements)
            .NotEmpty().WithMessage("Requirements are required")
            .Length(20, 2000).WithMessage("Requirements must be between 20 and 2000 characters");

        RuleFor(x => x.NumberOfPositions)
            .GreaterThan(0).WithMessage("Number of positions must be greater than 0");
    }
}
