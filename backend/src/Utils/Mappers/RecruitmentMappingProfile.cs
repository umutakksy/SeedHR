namespace SeedHR.Backend.Utils.Mappers;

using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

public class RecruitmentMappingProfile : Profile
{
    public RecruitmentMappingProfile()
    {
        CreateMap<Candidate, CandidateDto>();

        CreateMap<CreateCandidateRequest, Candidate>()
            .ForMember(dest => dest.AppliedDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "New"));

        CreateMap<JobPosting, JobPostingDto>()
            .ForMember(dest => dest.ApplicationCount, opt => opt.MapFrom(src => src.Candidates != null ? src.Candidates.Count : 0));

        CreateMap<CreateJobPostingRequest, JobPosting>()
            .ForMember(dest => dest.PostedDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Open"));

        CreateMap<Interview, InterviewDto>()
            .ForMember(dest => dest.CandidateName, opt => opt.MapFrom(src => src.Candidate != null ? src.Candidate.FullName : null))
            .ForMember(dest => dest.InterviewerName, opt => opt.MapFrom(src => src.InterviewerUser != null ? src.InterviewerUser.FullName : null))
            .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.JobPosting != null ? src.JobPosting.Title : null));

        CreateMap<CreateInterviewRequest, Interview>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Scheduled"));

        CreateMap<CompleteInterviewRequest, Interview>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Completed"));
    }
}
