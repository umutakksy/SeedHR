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

        CreateMap<CompetencyItem, CompetencyItemDto>().ReverseMap();
        
        CreateMap<CompetencyForm, CompetencyFormDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null));

        CreateMap<CreateCompetencyFormRequest, CompetencyForm>();

        CreateMap<Evaluation360, Evaluation360Dto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FullName : null))
            .ForMember(dest => dest.EvaluatorName, opt => opt.MapFrom(src => src.Evaluator != null ? src.Evaluator.FullName : null))
            .ForMember(dest => dest.CompetencyFormTitle, opt => opt.MapFrom(src => src.CompetencyForm != null ? src.CompetencyForm.Title : null));

        CreateMap<Create360Request, Evaluation360>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Draft"));
    }
}
