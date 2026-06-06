using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

namespace SeedHR.Backend.Utils.Mappers;

public class OnboardingMappingProfile : Profile
{
    public OnboardingMappingProfile()
    {
        CreateMap<OnboardingPlan, OnboardingPlanDto>();
        CreateMap<OnboardingTask, OnboardingTaskDto>();
        CreateMap<CreateOnboardingPlanRequest, OnboardingPlan>();
        CreateMap<CreateOnboardingTaskRequest, OnboardingTask>();
    }
}
