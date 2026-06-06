using FluentValidation;
using SeedHR.Backend.Models.DTOs;

namespace SeedHR.Backend.Utils.Validators;

public class AllocateAssetRequestValidator : AbstractValidator<AllocateAssetRequest>
{
    public AllocateAssetRequestValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");
    }
}
