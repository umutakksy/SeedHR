namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class CreatePerformanceGoalRequestValidator : AbstractValidator<CreatePerformanceGoalRequest>
{
    public CreatePerformanceGoalRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .Length(5, 200).WithMessage("Title must be between 5 and 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .Length(10, 1000).WithMessage("Description must be between 10 and 1000 characters");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required")
            .GreaterThan(x => x.StartDate).WithMessage("Due date must be after start date");

        RuleFor(x => x.TargetProgress)
            .GreaterThan(0).WithMessage("Target progress must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Target progress cannot exceed 100");
    }
}
