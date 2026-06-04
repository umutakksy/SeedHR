namespace SeedHR.Backend.Utils.Mappers;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using System;

public class AttendanceMappingProfile : Profile
{
    public AttendanceMappingProfile()
    {
        CreateMap<Attendance, AttendanceDto>()
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.CheckInTime.HasValue ? src.CheckInTime.Value.ToString("yyyy-MM-dd") : DateTime.UtcNow.ToString("yyyy-MM-dd")))
            .ForMember(dest => dest.CheckIn, opt => opt.MapFrom(src => src.CheckInTime.HasValue ? src.CheckInTime.Value.AddHours(3).ToString("HH:mm") : null))
            .ForMember(dest => dest.CheckOut, opt => opt.MapFrom(src => src.CheckOutTime.HasValue ? src.CheckOutTime.Value.AddHours(3).ToString("HH:mm") : null))
            .ForMember(dest => dest.TotalHoursWorked, opt => opt.MapFrom(src => 
                (src.CheckInTime.HasValue && src.CheckOutTime.HasValue) 
                ? Math.Round((src.CheckOutTime.Value - src.CheckInTime.Value).TotalHours, 2) 
                : (double?)null))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null));

        CreateMap<WorkSchedule, WorkScheduleDto>();
        CreateMap<CreateWorkScheduleRequest, WorkSchedule>();
    }
}
