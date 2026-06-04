namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IPerformanceService
{
    Task<PerformanceGoalDto> CreateGoalAsync(string userId, CreatePerformanceGoalRequest request);
    Task<PerformanceGoalDto> GetGoalByIdAsync(string id);
    Task<IEnumerable<PerformanceGoalDto>> GetUserGoalsAsync(string userId);
    Task<PerformanceGoalDto> UpdateGoalProgressAsync(string id, int progress);
    Task<bool> DeleteGoalAsync(string id);

    Task<PerformanceEvaluationDto> CreateEvaluationAsync(string evaluatorId, CreatePerformanceEvaluationRequest request);
    Task<PerformanceEvaluationDto> GetEvaluationByIdAsync(string id);
    Task<IEnumerable<PerformanceEvaluationDto>> GetUserEvaluationsAsync(string userId);
    Task<IEnumerable<PerformanceEvaluationDto>> GetPeriodEvaluationsAsync(string period);
}
