namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class CreatePerformanceEvaluationRequestValidator : AbstractValidator<CreatePerformanceEvaluationRequest>
{
    public CreatePerformanceEvaluationRequestValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Period)
            .NotEmpty().WithMessage("Period is required")
            .Length(2, 100).WithMessage("Period must be between 2 and 100 characters");

        RuleFor(x => x.Rating)
            .GreaterThanOrEqualTo(1).WithMessage("Rating must be at least 1")
            .LessThanOrEqualTo(5).WithMessage("Rating cannot exceed 5");

        RuleFor(x => x.Strengths)
            .Length(0, 1000).WithMessage("Strengths must not exceed 1000 characters");

        RuleFor(x => x.AreasForImprovement)
            .Length(0, 1000).WithMessage("Areas for improvement must not exceed 1000 characters");

        RuleFor(x => x.Comments)
            .Length(0, 1000).WithMessage("Comments must not exceed 1000 characters");
    }
}
