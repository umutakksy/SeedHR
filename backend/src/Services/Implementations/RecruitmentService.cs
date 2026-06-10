namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class RecruitmentService : IRecruitmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public RecruitmentService(IUnitOfWork unitOfWork, INotificationService notificationService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<CandidateDto> CreateCandidateAsync(CreateCandidateRequest request)
    {
        var candidate = new Candidate
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            City = request.City,
            Country = request.Country,
            CoverLetter = request.CoverLetter,
            AppliedDate = DateTime.UtcNow,
            Status = "New",
            AiMatchScore = null
        };

        var created = await _unitOfWork.Candidates.AddAsync(candidate);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CandidateDto>(created);
    }

    public async Task<CandidateDto> ApplyToJobPostingAsync(string jobPostingId, CreateCandidateRequest request, string cvPath, string cvFileName, string cvContentType, byte[] cvContent)
    {
        var candidate = new Candidate
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            City = request.City,
            Country = request.Country,
            CoverLetter = request.CoverLetter,
            CVPath = cvPath,
            CVContent = cvContent,
            CVFileName = cvFileName,
            CVContentType = cvContentType,
            AppliedDate = DateTime.UtcNow,
            Status = "New",
            AiMatchScore = null
        };

        var application = new CandidateApplication
        {
            JobPostingId = jobPostingId,
            ApplicationDate = DateTime.UtcNow,
            Status = "Applied"
        };

        candidate.Applications.Add(application);

        var created = await _unitOfWork.Candidates.AddAsync(candidate);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CandidateDto>(created);
    }

    public async Task<CandidateDto> GetCandidateByIdAsync(string id)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(id)
            ?? throw new NotFoundException($"Candidate with ID {id} not found");
        return _mapper.Map<CandidateDto>(candidate);
    }

    public async Task<(byte[] Content, string ContentType, string FileName)> GetCandidateCVAsync(string candidateId)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId)
            ?? throw new NotFoundException($"Candidate with ID {candidateId} not found");

        if (candidate.CVContent != null && candidate.CVContent.Length > 0)
        {
            return (candidate.CVContent, candidate.CVContentType ?? "application/octet-stream", candidate.CVFileName ?? "cv.pdf");
        }

        if (!string.IsNullOrEmpty(candidate.CVPath) && System.IO.File.Exists(candidate.CVPath))
        {
            var bytes = await System.IO.File.ReadAllBytesAsync(candidate.CVPath);
            var ext = System.IO.Path.GetExtension(candidate.CVPath);
            return (bytes, "application/octet-stream", $"{candidate.FullName.Replace(" ", "_")}_CV{ext}");
        }

        throw new NotFoundException("CV file content not found in database or server filesystem");
    }

    public async Task<IEnumerable<CandidateDto>> GetCandidatesAsync()
    {
        var candidates = await _unitOfWork.Candidates.GetAllAsync();
        return _mapper.Map<IEnumerable<CandidateDto>>(candidates);
    }

    public async Task<PaginatedResponse<CandidateDto>> GetPagedCandidatesAsync(int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Candidates.GetPagedAsync(null, page, pageSize, c => c.CreatedAt, true);
        var itemList = items.ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PaginatedResponse<CandidateDto>
        {
            Items = _mapper.Map<List<CandidateDto>>(itemList),
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<JobPostingDto> CreateJobPostingAsync(CreateJobPostingRequest request)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(request.PositionId)
            ?? throw new NotFoundException($"Position with ID {request.PositionId} not found");

        var jobPosting = new JobPosting
        {
            PositionId = request.PositionId,
            Title = request.Title,
            Description = request.Description,
            Requirements = request.Requirements,
            PostedDate = DateTime.UtcNow,
            Status = "Open",
            NumberOfPositions = request.NumberOfPositions
        };

        var created = await _unitOfWork.JobPostings.AddAsync(jobPosting);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<JobPostingDto>(created);
    }

    public async Task<JobPostingDto> GetJobPostingByIdAsync(string id)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(id)
            ?? throw new NotFoundException($"Job posting with ID {id} not found");
        return _mapper.Map<JobPostingDto>(jobPosting);
    }

    public async Task<IEnumerable<JobPostingDto>> GetOpenJobPostingsAsync()
    {
        var jobPostings = await _unitOfWork.JobPostings.GetByStatusAsync("Open");
        return _mapper.Map<IEnumerable<JobPostingDto>>(jobPostings);
    }

    public async Task<bool> CloseJobPostingAsync(string jobPostingId)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(jobPostingId)
            ?? throw new NotFoundException($"Job posting with ID {jobPostingId} not found");

        jobPosting.Status = "Closed";
        jobPosting.ClosedDate = DateTime.UtcNow;

        await _unitOfWork.JobPostings.UpdateAsync(jobPosting);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<JobPostingDto> UpdateJobPostingAsync(string id, UpdateJobPostingRequest request)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(id)
            ?? throw new NotFoundException($"Job posting with ID {id} not found");

        jobPosting.Title = request.Title;
        jobPosting.Description = request.Description;
        jobPosting.Requirements = request.Requirements;
        jobPosting.NumberOfPositions = request.NumberOfPositions;
        jobPosting.Status = request.Status;

        if (request.Status == "Open")
            jobPosting.ClosedDate = null;

        await _unitOfWork.JobPostings.UpdateAsync(jobPosting);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<JobPostingDto>(jobPosting);
    }

    public async Task<IEnumerable<JobPostingDto>> GetJobPostingsAsync()
    {
        var postings = await _unitOfWork.JobPostings.GetAllAsync();
        return _mapper.Map<IEnumerable<JobPostingDto>>(postings);
    }

    public async Task<InterviewDto> CreateInterviewAsync(CreateInterviewRequest request)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(request.CandidateId)
            ?? throw new NotFoundException($"Candidate with ID {request.CandidateId} not found");

        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId)
            ?? throw new NotFoundException($"Job posting with ID {request.JobPostingId} not found");

        var interviewerId = request.InterviewerUserId;
        User? hrUser = null;
        if (!string.IsNullOrEmpty(interviewerId))
        {
            hrUser = await _unitOfWork.Users.GetByIdAsync(interviewerId);
        }

        if (hrUser == null)
        {
            hrUser = (await _unitOfWork.Users.FindAsync(u => u.RoleId == "role_hr" || u.RoleId == "role_admin")).FirstOrDefault();
            interviewerId = hrUser?.Id ?? "default_interviewer";
        }

        var interview = new Interview
        {
            CandidateId = request.CandidateId,
            Candidate = candidate,
            InterviewerUserId = interviewerId,
            InterviewerUser = hrUser,
            JobPostingId = request.JobPostingId,
            JobPosting = jobPosting,
            ScheduledDate = request.ScheduledDate,
            Type = request.Type,
            Location = request.Location,
            Status = "Scheduled"
        };

        var created = await _unitOfWork.Interviews.AddAsync(interview);
        
        candidate.Status = "Interviewing";
        await _unitOfWork.Candidates.UpdateAsync(candidate);

        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<InterviewDto>(created);
    }

    public async Task<IEnumerable<InterviewDto>> GetInterviewsAsync()
    {
        var interviews = (await _unitOfWork.Interviews.GetAllAsync()).ToList();
        if (interviews.Any())
        {
            var candidateIds = interviews.Select(i => i.CandidateId).Where(id => !string.IsNullOrEmpty(id)).ToHashSet();
            var userIds = interviews.Select(i => i.InterviewerUserId).Where(id => !string.IsNullOrEmpty(id)).ToHashSet();
            var jobPostingIds = interviews.Select(i => i.JobPostingId).Where(id => !string.IsNullOrEmpty(id)).ToHashSet();

            var candidatesTask = _unitOfWork.Candidates.FindAsync(c => candidateIds.Contains(c.Id));
            var usersTask = _unitOfWork.Users.FindAsync(u => userIds.Contains(u.Id));
            var jobPostingsTask = _unitOfWork.JobPostings.FindAsync(j => jobPostingIds.Contains(j.Id));

            await Task.WhenAll(candidatesTask, usersTask, jobPostingsTask);

            var candidates = candidatesTask.Result.ToDictionary(c => c.Id);
            var users = usersTask.Result.ToDictionary(u => u.Id);
            var jobPostings = jobPostingsTask.Result.ToDictionary(j => j.Id);

            foreach (var interview in interviews)
            {
                if (!string.IsNullOrEmpty(interview.CandidateId) && candidates.TryGetValue(interview.CandidateId, out var candidate))
                    interview.Candidate = candidate;
                
                if (!string.IsNullOrEmpty(interview.InterviewerUserId) && users.TryGetValue(interview.InterviewerUserId, out var user))
                    interview.InterviewerUser = user;
                
                if (!string.IsNullOrEmpty(interview.JobPostingId) && jobPostings.TryGetValue(interview.JobPostingId, out var posting))
                    interview.JobPosting = posting;
            }
        }
        return _mapper.Map<IEnumerable<InterviewDto>>(interviews);
    }

    public async Task<InterviewDto> CompleteInterviewAsync(string id, CompleteInterviewRequest request)
    {
        var interview = await _unitOfWork.Interviews.GetByIdAsync(id)
            ?? throw new NotFoundException($"Interview with ID {id} not found");

        interview.Status = "Completed";
        interview.Rating = request.Rating;
        interview.Feedback = request.Feedback;
        interview.Result = request.Result;

        var updated = await _unitOfWork.Interviews.UpdateAsync(interview);

        var candidate = await _unitOfWork.Candidates.GetByIdAsync(interview.CandidateId);
        if (candidate != null)
        {
            if (request.Result == "Pass")
            {
                candidate.Status = "Offered";
            }
            else if (request.Result == "Fail")
            {
                candidate.Status = "Rejected";
            }
            await _unitOfWork.Candidates.UpdateAsync(candidate);
        }

        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<InterviewDto>(updated);
    }

    public async Task<CandidateDto> UpdateCandidateStatusAsync(string id, string status)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(id)
            ?? throw new NotFoundException($"Candidate with ID {id} not found");

        candidate.Status = status;
        var updated = await _unitOfWork.Candidates.UpdateAsync(candidate);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CandidateDto>(updated);
    }

    public async Task<ReferenceCheckDto> CreateReferenceCheckAsync(string candidateId, CreateReferenceCheckRequest request)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId)
            ?? throw new NotFoundException($"Candidate with ID {candidateId} not found");

        var reference = _mapper.Map<ReferenceCheck>(request);
        reference.CandidateId = candidateId;
        reference.Status = "Sent"; // Mark as sent immediately on request
        reference.CreatedAt = DateTime.UtcNow;
        reference.IsActive = true;

        await _unitOfWork.ReferenceChecks.AddAsync(reference);
        await _unitOfWork.SaveChangesAsync();

        reference.Candidate = candidate;
        return _mapper.Map<ReferenceCheckDto>(reference);
    }

    public async Task<ReferenceCheckDto> SubmitReferenceFeedbackAsync(string referenceId, SubmitReferenceFeedbackRequest request)
    {
        var reference = await _unitOfWork.ReferenceChecks.GetByIdAsync(referenceId)
            ?? throw new NotFoundException($"Reference check with ID {referenceId} not found");

        reference.VerificationNotes = request.VerificationNotes;
        reference.Scores = request.Scores;
        reference.Comments = request.Comments;
        reference.Status = "Completed";
        reference.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.ReferenceChecks.UpdateAsync(reference);
        await _unitOfWork.SaveChangesAsync();

        reference.Candidate = await _unitOfWork.Candidates.GetByIdAsync(reference.CandidateId);
        return _mapper.Map<ReferenceCheckDto>(reference);
    }

    public async Task<IEnumerable<ReferenceCheckDto>> GetReferencesForCandidateAsync(string candidateId)
    {
        var refs = (await _unitOfWork.ReferenceChecks.GetReferencesByCandidateAsync(candidateId)).ToList();
        var list = new List<ReferenceCheckDto>();
        if (refs.Any())
        {
            var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId);
            foreach (var r in refs)
            {
                r.Candidate = candidate;
                list.Add(_mapper.Map<ReferenceCheckDto>(r));
            }
        }
        return list;
    }

    public async Task<ReferenceCheckDto> GetReferenceByIdAsync(string id)
    {
        var r = await _unitOfWork.ReferenceChecks.GetByIdAsync(id)
            ?? throw new NotFoundException($"Reference check with ID {id} not found");

        r.Candidate = await _unitOfWork.Candidates.GetByIdAsync(r.CandidateId);
        return _mapper.Map<ReferenceCheckDto>(r);
    }
}
