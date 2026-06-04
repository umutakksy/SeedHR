namespace SeedHR.Backend.Utils.Mappers;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

public class LeaveMappingProfile : Profile
{
    public LeaveMappingProfile()
    {
        CreateMap<LeaveRequest, LeaveRequestDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null))
            .ForMember(dest => dest.LeaveTypeName, opt => opt.MapFrom(src => src.LeaveType != null ? src.LeaveType.Name : null));

        CreateMap<CreateLeaveRequestRequest, LeaveRequest>();

        CreateMap<LeaveBalance, LeaveBalanceDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null))
            .ForMember(dest => dest.LeaveTypeName, opt => opt.MapFrom(src => src.LeaveType != null ? src.LeaveType.Name : null))
            .ForMember(dest => dest.RemainingDays, opt => opt.MapFrom(src => src.TotalDays - src.UsedDays))
            .ForMember(dest => dest.RemainingPercentage, opt => opt.MapFrom(src => src.TotalDays > 0 ? ((src.TotalDays - src.UsedDays) * 100.0 / src.TotalDays) : 0));

        CreateMap<LeaveType, LeaveTypeDto>();
    }
}
