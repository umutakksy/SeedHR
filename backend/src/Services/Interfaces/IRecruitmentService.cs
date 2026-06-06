namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IRecruitmentService
{
    Task<CandidateDto> CreateCandidateAsync(CreateCandidateRequest request);
    Task<CandidateDto> ApplyToJobPostingAsync(string jobPostingId, CreateCandidateRequest request, string cvPath, string cvFileName, string cvContentType, byte[] cvContent);
    Task<CandidateDto> GetCandidateByIdAsync(string id);
    Task<(byte[] Content, string ContentType, string FileName)> GetCandidateCVAsync(string candidateId);
    Task<IEnumerable<CandidateDto>> GetCandidatesAsync();

    Task<JobPostingDto> CreateJobPostingAsync(CreateJobPostingRequest request);
    Task<JobPostingDto> GetJobPostingByIdAsync(string id);
    Task<IEnumerable<JobPostingDto>> GetOpenJobPostingsAsync();
    Task<IEnumerable<JobPostingDto>> GetJobPostingsAsync();
    Task<bool> CloseJobPostingAsync(string jobPostingId);

    Task<JobPostingDto> UpdateJobPostingAsync(string id, UpdateJobPostingRequest request);
    Task<InterviewDto> CreateInterviewAsync(CreateInterviewRequest request);
    Task<IEnumerable<InterviewDto>> GetInterviewsAsync();
    Task<InterviewDto> CompleteInterviewAsync(string id, CompleteInterviewRequest request);
    Task<CandidateDto> UpdateCandidateStatusAsync(string id, string status);

    // Reference checking
    Task<ReferenceCheckDto> CreateReferenceCheckAsync(string candidateId, CreateReferenceCheckRequest request);
    Task<ReferenceCheckDto> SubmitReferenceFeedbackAsync(string referenceId, SubmitReferenceFeedbackRequest request);
    Task<IEnumerable<ReferenceCheckDto>> GetReferencesForCandidateAsync(string candidateId);
    Task<ReferenceCheckDto> GetReferenceByIdAsync(string id);
}
