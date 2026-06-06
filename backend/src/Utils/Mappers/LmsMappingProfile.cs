namespace SeedHR.Backend.Utils.Mappers;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

public class LmsMappingProfile : Profile
{
    public LmsMappingProfile()
    {
        CreateMap<Course, CourseDto>();
        CreateMap<CreateCourseRequest, Course>();

        CreateMap<CourseAssignment, CourseAssignmentDto>()
            .ForMember(dest => dest.CourseTitle, opt => opt.MapFrom(src => src.Course != null ? src.Course.Title : null))
            .ForMember(dest => dest.CourseDescription, opt => opt.MapFrom(src => src.Course != null ? src.Course.Description : null))
            .ForMember(dest => dest.CourseType, opt => opt.MapFrom(src => src.Course != null ? src.Course.Type : null))
            .ForMember(dest => dest.CourseDurationHours, opt => opt.MapFrom(src => src.Course != null ? src.Course.DurationHours : 0))
            .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null));
    }
}
