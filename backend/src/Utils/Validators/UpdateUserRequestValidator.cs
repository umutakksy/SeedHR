namespace SeedHR.Backend.Utils.Validators;

using FluentValidation;
using SeedHR.Backend.Models.DTOs;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(@"^\d{10,}$").WithMessage("Phone must be at least 10 digits");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .Must(dob => (DateTime.UtcNow.Year - dob.Year >= 16) && (DateTime.UtcNow.Year - dob.Year <= 70))
            .WithMessage("Age must be between 16 and 70 years");

        RuleFor(x => x.Gender)
            .NotEmpty().WithMessage("Gender is required")
            .Must(g => g == "Male" || g == "Female" || g == "Other")
            .WithMessage("Gender must be Male, Female, or Other");
    }
}
