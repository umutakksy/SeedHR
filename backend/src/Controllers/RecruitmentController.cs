using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Net.Http;
using Microsoft.Extensions.Configuration;

namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin")]
public class RecruitmentController : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService;
    private readonly IWebHostEnvironment _env;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _turnstileSecretKey;

    public RecruitmentController(IRecruitmentService recruitmentService, IWebHostEnvironment env, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _recruitmentService = recruitmentService;
        _env = env;
        _httpClientFactory = httpClientFactory;
        _turnstileSecretKey = Environment.GetEnvironmentVariable("TURNSTILE_SECRET_KEY") 
                              ?? configuration["Turnstile:SecretKey"] 
                              ?? "0x4AAAAAADe7IxiQPHhZQ2ewHtNCl_9xpGQ";
    }

    [HttpPost("candidates")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<CandidateDto>>> CreateCandidate([FromBody] CreateCandidateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<CandidateDto>.ErrorResponse("Invalid input"));

        var candidate = await _recruitmentService.CreateCandidateAsync(request);
        return Created("", ApiResponse<CandidateDto>.SuccessResponse(candidate, "Candidate created successfully"));
    }

    [HttpGet("candidates/{id}")]
    public async Task<ActionResult<ApiResponse<CandidateDto>>> GetCandidate(string id)
    {
        var candidate = await _recruitmentService.GetCandidateByIdAsync(id);
        return Ok(ApiResponse<CandidateDto>.SuccessResponse(candidate, "Candidate retrieved successfully"));
    }

    [HttpGet("candidates")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CandidateDto>>>> GetCandidates()
    {
        var candidates = await _recruitmentService.GetCandidatesAsync();
        return Ok(ApiResponse<IEnumerable<CandidateDto>>.SuccessResponse(candidates, "Candidates retrieved successfully"));
    }

    [HttpPost("job-postings")]
    public async Task<ActionResult<ApiResponse<JobPostingDto>>> CreateJobPosting([FromBody] CreateJobPostingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<JobPostingDto>.ErrorResponse("Invalid input"));

        var jobPosting = await _recruitmentService.CreateJobPostingAsync(request);
        return Created("", ApiResponse<JobPostingDto>.SuccessResponse(jobPosting, "Job posting created successfully"));
    }

    [HttpGet("job-postings/{id}")]
    public async Task<ActionResult<ApiResponse<JobPostingDto>>> GetJobPosting(string id)
    {
        var jobPosting = await _recruitmentService.GetJobPostingByIdAsync(id);
        return Ok(ApiResponse<JobPostingDto>.SuccessResponse(jobPosting, "Job posting retrieved successfully"));
    }

    [HttpGet("job-postings")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<JobPostingDto>>>> GetOpenJobPostings()
    {
        var jobPostings = await _recruitmentService.GetOpenJobPostingsAsync();
        return Ok(ApiResponse<IEnumerable<JobPostingDto>>.SuccessResponse(jobPostings, "Open job postings retrieved successfully"));
    }

    [HttpPost("job-postings/{jobPostingId}/apply")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<CandidateDto>>> ApplyToJobPosting(
        string jobPostingId,
        [FromForm] string firstName,
        [FromForm] string lastName,
        [FromForm] string email,
        [FromForm] string phone,
        [FromForm] string? address,
        [FromForm] string? city,
        [FromForm] string? country,
        [FromForm] string? coverLetter,
        [FromForm] string? turnstileToken,
        IFormFile cv)
    {
        // Verify Turnstile Captcha
        var appEnv = Environment.GetEnvironmentVariable("APP_ENVIRONMENT") ?? "Development";
        var isDev = appEnv.Equals("Development", StringComparison.OrdinalIgnoreCase);

        if (!isDev)
        {
            if (string.IsNullOrEmpty(turnstileToken))
            {
                return BadRequest(ApiResponse<CandidateDto>.ErrorResponse("CAPTCHA doğrulaması zorunludur."));
            }

            var (turnstileSuccess, turnstileError) = await VerifyTurnstileTokenAsync(turnstileToken);
            if (!turnstileSuccess)
            {
                return BadRequest(ApiResponse<CandidateDto>.ErrorResponse($"CAPTCHA doğrulaması başarısız oldu. Hata: {turnstileError}"));
            }
        }

        if (cv == null || cv.Length == 0)
            return BadRequest(ApiResponse<CandidateDto>.ErrorResponse("CV file is required"));

        var uploadFolder = Path.Combine(_env.ContentRootPath, "uploads", "cvs");
        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var fileExtension = Path.GetExtension(cv.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadFolder, fileName);

        byte[] cvBytes;
        using (var memoryStream = new MemoryStream())
        {
            await cv.CopyToAsync(memoryStream);
            cvBytes = memoryStream.ToArray();
        }

        // Also save to filesystem as a fallback
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await stream.WriteAsync(cvBytes, 0, cvBytes.Length);
        }

        var request = new CreateCandidateRequest
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Address = address,
            City = city,
            Country = country,
            CoverLetter = coverLetter
        };

        var candidate = await _recruitmentService.ApplyToJobPostingAsync(jobPostingId, request, filePath, cv.FileName, cv.ContentType, cvBytes);
        return Created("", ApiResponse<CandidateDto>.SuccessResponse(candidate, "Application submitted successfully"));
    }

    [HttpPut("job-postings/{id}/close")]
    public async Task<ActionResult<ApiResponse<bool>>> CloseJobPosting(string id)
    {
        var result = await _recruitmentService.CloseJobPostingAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Job posting closed successfully"));
    }

    [HttpGet("job-postings/all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<JobPostingDto>>>> GetJobPostings()
    {
        var postings = await _recruitmentService.GetJobPostingsAsync();
        return Ok(ApiResponse<IEnumerable<JobPostingDto>>.SuccessResponse(postings, "All job postings retrieved successfully"));
    }

    [HttpPut("candidates/{id}/status")]
    public async Task<ActionResult<ApiResponse<CandidateDto>>> UpdateCandidateStatus(string id, [FromBody] UpdateCandidateStatusRequest request)
    {
        if (string.IsNullOrEmpty(request?.Status))
            return BadRequest(ApiResponse<CandidateDto>.ErrorResponse("Status is required"));
        var candidate = await _recruitmentService.UpdateCandidateStatusAsync(id, request.Status);
        return Ok(ApiResponse<CandidateDto>.SuccessResponse(candidate, "Candidate status updated successfully"));
    }

    [HttpPut("job-postings/{id}")]
    public async Task<ActionResult<ApiResponse<JobPostingDto>>> UpdateJobPosting(string id, [FromBody] UpdateJobPostingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<JobPostingDto>.ErrorResponse("Invalid input"));

        var jobPosting = await _recruitmentService.UpdateJobPostingAsync(id, request);
        return Ok(ApiResponse<JobPostingDto>.SuccessResponse(jobPosting, "Job posting updated successfully"));
    }

    [HttpGet("candidates/{id}/cv")]
    public async Task<IActionResult> DownloadCandidateCV(string id)
    {
        try
        {
            var (bytes, contentType, fileName) = await _recruitmentService.GetCandidateCVAsync(id);
            return File(bytes, contentType, fileName);
        }
        catch (System.Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("interviews")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InterviewDto>>>> GetInterviews()
    {
        var interviews = await _recruitmentService.GetInterviewsAsync();
        return Ok(ApiResponse<IEnumerable<InterviewDto>>.SuccessResponse(interviews, "Interviews retrieved successfully"));
    }

    [HttpPost("interviews")]
    public async Task<ActionResult<ApiResponse<InterviewDto>>> CreateInterview([FromBody] CreateInterviewRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<InterviewDto>.ErrorResponse("Invalid input"));

        var interview = await _recruitmentService.CreateInterviewAsync(request);
        return Created("", ApiResponse<InterviewDto>.SuccessResponse(interview, "Interview scheduled successfully"));
    }

    [HttpPost("interviews/{id}/complete")]
    public async Task<ActionResult<ApiResponse<InterviewDto>>> CompleteInterview(string id, [FromBody] CompleteInterviewRequest request)
    {
        var interview = await _recruitmentService.CompleteInterviewAsync(id, request);
        return Ok(ApiResponse<InterviewDto>.SuccessResponse(interview, "Interview completed successfully"));
    }

    private async Task<(bool Success, string ErrorMessage)> VerifyTurnstileTokenAsync(string token)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var values = new Dictionary<string, string>
            {
                { "secret", _turnstileSecretKey },
                { "response", token }
            };

            var content = new FormUrlEncodedContent(values);
            var response = await client.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
            var jsonString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode) 
                return (false, $"HTTP Hata {response.StatusCode}: {jsonString}");

            using var doc = System.Text.Json.JsonDocument.Parse(jsonString);
            if (doc.RootElement.TryGetProperty("success", out var successProp) && successProp.GetBoolean())
            {
                return (true, string.Empty);
            }

            var errors = new List<string>();
            if (doc.RootElement.TryGetProperty("error-codes", out var errorCodesProp) && errorCodesProp.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var err in errorCodesProp.EnumerateArray())
                {
                    errors.Add(err.GetString() ?? "");
                }
            }

            var errorStr = errors.Count > 0 ? string.Join(", ", errors) : "Bilinmeyen Turnstile hatası";
            return (false, errorStr);
        }
        catch (Exception ex)
        {
            return (false, $"İstisna oluştu: {ex.Message}");
        }
    }
}

public class UpdateCandidateStatusRequest
{
    public string Status { get; set; } = null!;
}

