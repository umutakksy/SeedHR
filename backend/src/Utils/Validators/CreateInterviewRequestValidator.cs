namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class CreateInterviewRequestValidator : AbstractValidator<CreateInterviewRequest>
{
    public CreateInterviewRequestValidator()
    {
        RuleFor(x => x.CandidateId)
            .NotEmpty().WithMessage("Candidate ID is required");

        RuleFor(x => x.JobPostingId)
            .NotEmpty().WithMessage("Job posting ID is required");

        RuleFor(x => x.ScheduledDate)
            .NotEmpty().WithMessage("Scheduled date is required")
            .GreaterThan(DateTime.UtcNow).WithMessage("Scheduled date must be in the future");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Interview type is required")
            .Length(2, 50).WithMessage("Interview type must be between 2 and 50 characters");
    }
}
