namespace SeedHR.Backend.Utils.Mappers;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

public class PositionMappingProfile : Profile
{
    public PositionMappingProfile()
    {
        CreateMap<Position, PositionDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
            .ForMember(dest => dest.EmployeeCount, opt => opt.MapFrom(src => src.Employees != null ? src.Employees.Count : 0));

        CreateMap<CreatePositionRequest, Position>();

        CreateMap<UpdatePositionRequest, Position>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}
