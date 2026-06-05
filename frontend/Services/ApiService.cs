using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using SeedHR.Frontend.Models;

namespace SeedHR.Frontend.Services
{
    public class ApiService
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ApiService> _logger;

        public ApiService(IHttpClientFactory clientFactory, IHttpContextAccessor httpContextAccessor, ILogger<ApiService> logger)
        {
            _clientFactory = clientFactory;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        private HttpClient GetClient()
        {
            var client = _clientFactory.CreateClient();
            var baseUrl = Environment.GetEnvironmentVariable("BACKEND_API_URL") ?? "http://localhost:5000/api/";
            client.BaseAddress = new Uri(baseUrl);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Check if user is authenticated and has a token claim
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
            {
                _logger.LogWarning("HttpContext is null");
                return client;
            }

            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var token = context.User.FindFirst("Token")?.Value;
                if (!string.IsNullOrEmpty(token))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    _logger.LogInformation("JWT token found and added to Authorization header");
                }
                else
                {
                    _logger.LogWarning("User is authenticated but Token claim is empty or null");
                    var allClaims = string.Join(", ", context.User.Claims.Select(c => $"{c.Type}={c.Value}"));
                    _logger.LogDebug("Available claims: {Claims}", allClaims);
                }
            }
            else
            {
                _logger.LogDebug("User is not authenticated in HttpContext");
            }

            return client;
        }

        // Generic API wrappers
        private async Task<ApiResponse<T>> DeserializeResponseAsync<T>(HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(content))
            {
                if (response.IsSuccessStatusCode)
                {
                    return new ApiResponse<T>
                    {
                        Success = true,
                        Message = "Success",
                        Data = default!,
                        Timestamp = DateTime.UtcNow
                    };
                }
                return ApiResponse<T>.ErrorResponse($"API returned empty response with status {(int)response.StatusCode}: {response.ReasonPhrase}");
            }

            var trimmedContent = content.Trim();
            if (!trimmedContent.StartsWith("{") && !trimmedContent.StartsWith("["))
            {
                if (response.IsSuccessStatusCode)
                {
                    return new ApiResponse<T>
                    {
                        Success = true,
                        Message = trimmedContent,
                        Data = default!,
                        Timestamp = DateTime.UtcNow
                    };
                }
                return ApiResponse<T>.ErrorResponse($"API returned non-JSON error {(int)response.StatusCode}: {trimmedContent}");
            }

            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<T>>(content, options);
                if (apiResponse != null) return apiResponse;
                return ApiResponse<T>.ErrorResponse($"Failed to deserialize response as {typeof(T).Name}");
            }
            catch (JsonException ex)
            {
                return ApiResponse<T>.ErrorResponse($"JSON deserialization error: {ex.Message}. Raw content: {trimmedContent}");
            }
        }

        public async Task<ApiResponse<T>> GetAsync<T>(string url)
        {
            try
            {
                var client = GetClient();
                var response = await client.GetAsync(url);
                return await DeserializeResponseAsync<T>(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<T>.ErrorResponse($"API Error: {ex.Message}");
            }
        }

        public async Task<ApiResponse<TResponse>> PostAsync<TRequest, TResponse>(string url, TRequest data)
        {
            try
            {
                var client = GetClient();
                var response = await client.PostAsJsonAsync(url, data);
                return await DeserializeResponseAsync<TResponse>(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<TResponse>.ErrorResponse($"API Error: {ex.Message}");
            }
        }

        public async Task<ApiResponse<TResponse>> PutAsync<TRequest, TResponse>(string url, TRequest data)
        {
            try
            {
                var client = GetClient();
                var response = await client.PutAsJsonAsync(url, data);
                return await DeserializeResponseAsync<TResponse>(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<TResponse>.ErrorResponse($"API Error: {ex.Message}");
            }
        }

        public async Task<ApiResponse<TResponse>> DeleteAsync<TResponse>(string url)
        {
            try
            {
                var client = GetClient();
                var response = await client.DeleteAsync(url);
                return await DeserializeResponseAsync<TResponse>(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<TResponse>.ErrorResponse($"API Error: {ex.Message}");
            }
        }

        // Specialized multipart post for documents/cv upload
        public async Task<ApiResponse<TResponse>> PostMultipartAsync<TResponse>(string url, MultipartFormDataContent formContent)
        {
            try
            {
                var client = GetClient();
                var response = await client.PostAsync(url, formContent);
                return await DeserializeResponseAsync<TResponse>(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<TResponse>.ErrorResponse($"API Error: {ex.Message}");
            }
        }

        public async Task<HttpResponseMessage> DownloadFileAsync(string url)
        {
            var client = GetClient();
            return await client.GetAsync(url);
        }

        // Specialized API Call Handlers

        // Auth
        public Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request) 
            => PostAsync<LoginRequest, LoginResponse>("Auth/login", request);

        public Task<ApiResponse<UserDto>> RegisterAsync(CreateUserRequest request) 
            => PostAsync<CreateUserRequest, UserDto>("Auth/register", request);

        public Task<ApiResponse<bool>> LogoutAsync() 
            => PostAsync<object, bool>("Auth/logout", new { });

        // Dashboard
        public Task<ApiResponse<DashboardStatisticsDto>> GetDashboardStatisticsAsync()
            => GetAsync<DashboardStatisticsDto>("Dashboard/stats");

        // Users / Employees
        public Task<ApiResponse<IEnumerable<UserDto>>> GetUsersAsync()
            => GetAsync<IEnumerable<UserDto>>("Users");

        public Task<ApiResponse<UserDto>> GetUserByIdAsync(string id)
            => GetAsync<UserDto>($"Users/{id}");

        public Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserRequest request)
            => PostAsync<CreateUserRequest, UserDto>("Users", request);

        public Task<ApiResponse<UserDto>> UpdateUserAsync(string id, UpdateUserRequest request)
            => PutAsync<UpdateUserRequest, UserDto>($"Users/{id}", request);

        public Task<ApiResponse<bool>> DeleteUserAsync(string id)
            => DeleteAsync<bool>($"Users/{id}");

        // Departments
        public Task<ApiResponse<IEnumerable<DepartmentDto>>> GetDepartmentsAsync()
            => GetAsync<IEnumerable<DepartmentDto>>("Departments");

        public Task<ApiResponse<DepartmentDto>> CreateDepartmentAsync(CreateDepartmentRequest request)
            => PostAsync<CreateDepartmentRequest, DepartmentDto>("Departments", request);

        public Task<ApiResponse<DepartmentDto>> UpdateDepartmentAsync(string id, UpdateDepartmentRequest request)
            => PutAsync<UpdateDepartmentRequest, DepartmentDto>($"Departments/{id}", request);

        public Task<ApiResponse<bool>> DeleteDepartmentAsync(string id)
            => DeleteAsync<bool>($"Departments/{id}");

        // Positions
        public Task<ApiResponse<IEnumerable<PositionDto>>> GetPositionsAsync()
            => GetAsync<IEnumerable<PositionDto>>("Positions");

        public Task<ApiResponse<PositionDto>> CreatePositionAsync(CreatePositionRequest request)
            => PostAsync<CreatePositionRequest, PositionDto>("Positions", request);

        public Task<ApiResponse<PositionDto>> UpdatePositionAsync(string id, UpdatePositionRequest request)
            => PutAsync<UpdatePositionRequest, PositionDto>($"Positions/{id}", request);

        public Task<ApiResponse<bool>> DeletePositionAsync(string id)
            => DeleteAsync<bool>($"Positions/{id}");

        // Leave Requests
        public Task<ApiResponse<IEnumerable<LeaveRequestDto>>> GetLeaveRequestsAsync()
            => GetAsync<IEnumerable<LeaveRequestDto>>("Leave/requests");

        public Task<ApiResponse<IEnumerable<LeaveRequestDto>>> GetMyLeaveRequestsAsync()
            => GetAsync<IEnumerable<LeaveRequestDto>>("Leave/requests");

        public Task<ApiResponse<LeaveRequestDto>> CreateLeaveRequestAsync(CreateLeaveRequestRequest request)
            => PostAsync<CreateLeaveRequestRequest, LeaveRequestDto>("Leave/requests", request);

        public Task<ApiResponse<LeaveRequestDto>> ApproveLeaveRequestAsync(string id, LeaveApprovalRequest request)
            => PutAsync<LeaveApprovalRequest, LeaveRequestDto>($"Leave/requests/{id}/approve", request);

        public Task<ApiResponse<LeaveRequestDto>> RejectLeaveRequestAsync(string id, LeaveApprovalRequest request)
            => PutAsync<LeaveApprovalRequest, LeaveRequestDto>($"Leave/requests/{id}/reject", request);

        public Task<ApiResponse<IEnumerable<LeaveBalanceDto>>> GetLeaveBalancesAsync(string userId)
            => GetAsync<IEnumerable<LeaveBalanceDto>>("Leave/balances");

        public Task<ApiResponse<IEnumerable<LeaveTypeDto>>> GetLeaveTypesAsync()
            => GetAsync<IEnumerable<LeaveTypeDto>>("Leave/types");

        // Attendance
        public Task<ApiResponse<IEnumerable<AttendanceDto>>> GetAttendanceRecordsAsync()
            => GetAsync<IEnumerable<AttendanceDto>>("Attendance");

        public Task<ApiResponse<IEnumerable<AttendanceDto>>> GetMyAttendanceAsync()
            => GetAsync<IEnumerable<AttendanceDto>>("Attendance/records");

        public Task<ApiResponse<AttendanceDto>> CheckInAsync()
            => PostAsync<object, AttendanceDto>("Attendance/checkin", new { });

        public Task<ApiResponse<AttendanceDto>> CheckOutAsync()
            => PostAsync<object, AttendanceDto>("Attendance/checkout", new { });

        // WorkSchedules (Vardiya / Çalışma Takvimi)
        public Task<ApiResponse<IEnumerable<WorkScheduleDto>>> GetWorkSchedulesAsync()
            => GetAsync<IEnumerable<WorkScheduleDto>>("WorkSchedules");

        public Task<ApiResponse<IEnumerable<WorkScheduleDto>>> GetWorkSchedulesByRangeAsync(DateTime start, DateTime end)
            => GetAsync<IEnumerable<WorkScheduleDto>>($"WorkSchedules/range?start={start:yyyy-MM-dd}&end={end:yyyy-MM-dd}");

        public Task<ApiResponse<WorkScheduleDto>> CreateWorkScheduleAsync(CreateWorkScheduleRequest request)
            => PostAsync<CreateWorkScheduleRequest, WorkScheduleDto>("WorkSchedules", request);

        public Task<ApiResponse<WorkScheduleDto>> UpdateWorkScheduleAsync(string id, CreateWorkScheduleRequest request)
            => PutAsync<CreateWorkScheduleRequest, WorkScheduleDto>($"WorkSchedules/{id}", request);

        public Task<ApiResponse<bool>> DeleteWorkScheduleAsync(string id)
            => DeleteAsync<bool>($"WorkSchedules/{id}");

        // Documents
        public Task<ApiResponse<IEnumerable<DocumentDto>>> GetUserDocumentsAsync(string userId)
            => GetAsync<IEnumerable<DocumentDto>>($"Documents/user/{userId}");

        public async Task<ApiResponse<DocumentDto>> UploadDocumentAsync(string userId, string documentType, string fileName, Stream fileStream)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(userId), "userId");
            content.Add(new StringContent(documentType), "documentType");
            
            var streamContent = new StreamContent(fileStream);
            content.Add(streamContent, "file", fileName);

            return await PostMultipartAsync<DocumentDto>("Documents/upload", content);
        }

        public Task<ApiResponse<bool>> DeleteDocumentAsync(string id)
            => DeleteAsync<bool>($"Documents/{id}");

        // Recruitment (İşe Alım)
        public Task<ApiResponse<IEnumerable<JobPostingDto>>> GetJobPostingsAsync()
            => GetAsync<IEnumerable<JobPostingDto>>("Recruitment/job-postings/all");

        public Task<ApiResponse<IEnumerable<JobPostingDto>>> GetOpenJobPostingsAsync()
            => GetAsync<IEnumerable<JobPostingDto>>("Recruitment/job-postings");

        public Task<ApiResponse<JobPostingDto>> CreateJobPostingAsync(CreateJobPostingRequest request)
            => PostAsync<CreateJobPostingRequest, JobPostingDto>("Recruitment/job-postings", request);

        public Task<ApiResponse<bool>> CloseJobPostingAsync(string id)
            => PutAsync<object, bool>($"Recruitment/job-postings/{id}/close", new { });

        public Task<ApiResponse<IEnumerable<CandidateDto>>> GetCandidatesAsync()
            => GetAsync<IEnumerable<CandidateDto>>("Recruitment/candidates");

        public Task<ApiResponse<CandidateDto>> UpdateCandidateStatusAsync(string id, string status)
            => PutAsync<object, CandidateDto>($"Recruitment/candidates/{id}/status", new { Status = status });

        public Task<ApiResponse<JobPostingDto>> UpdateJobPostingAsync(string id, UpdateJobPostingRequest request)
            => PutAsync<UpdateJobPostingRequest, JobPostingDto>($"Recruitment/job-postings/{id}", request);

        public Task<HttpResponseMessage> DownloadCandidateCVAsync(string candidateId)
        {
            var client = GetClient();
            return client.GetAsync($"Recruitment/candidates/{candidateId}/cv");
        }

        public async Task<ApiResponse<CandidateDto>> ApplyToJobPostingAsync(string jobPostingId, CreateCandidateRequest candidateInfo, string cvFileName, Stream cvFileStream, string turnstileToken)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(candidateInfo.FirstName), "FirstName");
            content.Add(new StringContent(candidateInfo.LastName), "LastName");
            content.Add(new StringContent(candidateInfo.Email), "Email");
            content.Add(new StringContent(candidateInfo.Phone), "Phone");
            if (candidateInfo.Address != null) content.Add(new StringContent(candidateInfo.Address), "Address");
            if (candidateInfo.City != null) content.Add(new StringContent(candidateInfo.City), "City");
            if (candidateInfo.Country != null) content.Add(new StringContent(candidateInfo.Country), "Country");
            if (candidateInfo.CoverLetter != null) content.Add(new StringContent(candidateInfo.CoverLetter), "CoverLetter");
            content.Add(new StringContent(turnstileToken ?? ""), "turnstileToken");

            var streamContent = new StreamContent(cvFileStream);
            content.Add(streamContent, "cv", cvFileName);

            return await PostMultipartAsync<CandidateDto>($"Recruitment/job-postings/{jobPostingId}/apply", content);
        }

        // Interviews
        public Task<ApiResponse<IEnumerable<InterviewDto>>> GetInterviewsAsync()
            => GetAsync<IEnumerable<InterviewDto>>("Recruitment/interviews");

        public Task<ApiResponse<InterviewDto>> CreateInterviewAsync(CreateInterviewRequest request)
            => PostAsync<CreateInterviewRequest, InterviewDto>("Recruitment/interviews", request);

        public Task<ApiResponse<InterviewDto>> CompleteInterviewAsync(string id, CompleteInterviewRequest request)
            => PutAsync<CompleteInterviewRequest, InterviewDto>($"Recruitment/interviews/{id}/complete", request);

        // Announcements
        public Task<ApiResponse<IEnumerable<AnnouncementDto>>> GetAnnouncementsAsync()
            => GetAsync<IEnumerable<AnnouncementDto>>("Announcements");

        public Task<ApiResponse<IEnumerable<AnnouncementDto>>> GetPublicAnnouncementsAsync()
            => GetAsync<IEnumerable<AnnouncementDto>>("Announcements/public");

        public Task<ApiResponse<AnnouncementDto>> CreateAnnouncementAsync(CreateAnnouncementRequest request)
            => PostAsync<CreateAnnouncementRequest, AnnouncementDto>("Announcements", request);

        public Task<ApiResponse<AnnouncementDto>> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest request)
            => PutAsync<UpdateAnnouncementRequest, AnnouncementDto>($"Announcements/{id}", request);

        public Task<ApiResponse<bool>> DeleteAnnouncementAsync(string id)
            => DeleteAsync<bool>($"Announcements/{id}");

        // Performance
        public Task<ApiResponse<IEnumerable<PerformanceGoalDto>>> GetPerformanceGoalsAsync(string userId)
            => GetAsync<IEnumerable<PerformanceGoalDto>>($"Performance/goals/user/{userId}");

        public Task<ApiResponse<PerformanceGoalDto>> CreatePerformanceGoalAsync(string userId, CreatePerformanceGoalRequest request)
            => PostAsync<CreatePerformanceGoalRequest, PerformanceGoalDto>($"Performance/goals?userId={userId}", request);

        public Task<ApiResponse<PerformanceGoalDto>> UpdatePerformanceGoalStatusAsync(string id, string status)
            => PutAsync<object, PerformanceGoalDto>($"Performance/goals/{id}/status?status={status}", new { });

        public Task<ApiResponse<IEnumerable<PerformanceEvaluationDto>>> GetPerformanceEvaluationsAsync(string userId)
            => GetAsync<IEnumerable<PerformanceEvaluationDto>>($"Performance/evaluations/user/{userId}");

        public Task<ApiResponse<PerformanceEvaluationDto>> CreatePerformanceEvaluationAsync(CreatePerformanceEvaluationRequest request)
            => PostAsync<CreatePerformanceEvaluationRequest, PerformanceEvaluationDto>("Performance/evaluations", request);

        // Notifications
        public Task<ApiResponse<IEnumerable<NotificationDto>>> GetNotificationsAsync()
            => GetAsync<IEnumerable<NotificationDto>>("Notifications");

        public Task<ApiResponse<bool>> MarkNotificationAsReadAsync(string id)
            => PostAsync<object, bool>($"Notifications/{id}/read", new { });

        // Logs
        public Task<ApiResponse<IEnumerable<LogFileDto>>> GetLogFilesAsync()
            => GetAsync<IEnumerable<LogFileDto>>("Logs");

        public Task<ApiResponse<string>> ViewLogAsync(string fileName, int lines = 200)
            => GetAsync<string>($"Logs/view/{fileName}?lines={lines}");

        public Task<ApiResponse<bool>> DeleteLogFileAsync(string fileName)
            => DeleteAsync<bool>($"Logs/{fileName}");

        // AI Score
        public Task<ApiResponse<CvScoreResult>> ScoreCvAsync(string candidateId, string? jobPostingId = null)
        {
            var url = $"Ai/score-cv/{candidateId}";
            if (!string.IsNullOrEmpty(jobPostingId))
            {
                url += $"?jobPostingId={jobPostingId}";
            }
            return PostAsync<object, CvScoreResult>(url, new { });
        }
    }
}
