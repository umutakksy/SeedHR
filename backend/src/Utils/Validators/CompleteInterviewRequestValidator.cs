namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class CompleteInterviewRequestValidator : AbstractValidator<CompleteInterviewRequest>
{
    public CompleteInterviewRequestValidator()
    {
        RuleFor(x => x.Rating)
            .GreaterThanOrEqualTo(1).WithMessage("Rating must be at least 1")
            .LessThanOrEqualTo(5).WithMessage("Rating cannot exceed 5");

        RuleFor(x => x.Result)
            .NotEmpty().WithMessage("Result is required")
            .Length(2, 50).WithMessage("Result must be between 2 and 50 characters")
            .Must(r => r == "Pass" || r == "Fail" || r == "Hold")
            .WithMessage("Result must be Pass, Fail, or Hold");

        RuleFor(x => x.Feedback)
            .Length(0, 2000).WithMessage("Feedback must not exceed 2000 characters");
    }
}
