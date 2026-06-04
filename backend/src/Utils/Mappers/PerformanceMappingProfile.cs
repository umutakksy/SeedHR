namespace SeedHR.Backend.Utils.Mappers;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

public class PerformanceMappingProfile : Profile
{
    public PerformanceMappingProfile()
    {
        CreateMap<PerformanceGoal, PerformanceGoalDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null));

        CreateMap<CreatePerformanceGoalRequest, PerformanceGoal>();

        CreateMap<PerformanceEvaluation, PerformanceEvaluationDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null));

        CreateMap<CreatePerformanceEvaluationRequest, PerformanceEvaluation>()
            .ForMember(dest => dest.EvaluationDate, opt => opt.MapFrom(_ => DateTime.UtcNow));
    }
}
