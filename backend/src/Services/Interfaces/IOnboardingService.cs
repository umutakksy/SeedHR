using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface IOnboardingService
{
    Task<OnboardingPlanDto> CreatePlanAsync(CreateOnboardingPlanRequest request);
    Task<IEnumerable<OnboardingPlanDto>> GetPlansAsync();
    Task<OnboardingPlanDto> GetPlanByIdAsync(string id);
    Task<OnboardingProgressDto> StartOnboardingAsync(string userId, string planId);
    Task<OnboardingProgressDto> GetProgressAsync(string userId);
    Task<OnboardingProgressDto> CompleteTaskAsync(string userId, string taskId, CompleteTaskRequest request);
    Task<IEnumerable<OnboardingProgressDto>> GetActiveOnboardingsAsync();
    Task SendRemindersAsync();
}
