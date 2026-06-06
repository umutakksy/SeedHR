namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IPerformanceService
{
    Task<PerformanceGoalDto> CreateGoalAsync(string userId, CreatePerformanceGoalRequest request);
    Task<PerformanceGoalDto> GetGoalByIdAsync(string id);
    Task<IEnumerable<PerformanceGoalDto>> GetUserGoalsAsync(string userId);
    Task<PerformanceGoalDto> UpdateGoalProgressAsync(string id, int progress);
    Task<PerformanceGoalDto> UpdateGoalStatusAsync(string id, string status);
    Task<bool> DeleteGoalAsync(string id);

    Task<PerformanceEvaluationDto> CreateEvaluationAsync(string evaluatorId, CreatePerformanceEvaluationRequest request);
    Task<PerformanceEvaluationDto> GetEvaluationByIdAsync(string id);
    Task<IEnumerable<PerformanceEvaluationDto>> GetUserEvaluationsAsync(string userId);
    Task<IEnumerable<PerformanceEvaluationDto>> GetPeriodEvaluationsAsync(string period);

    // 360 Degree evaluations and rubrics
    Task<CompetencyFormDto> CreateCompetencyFormAsync(CreateCompetencyFormRequest request);
    Task<CompetencyFormDto> GetCompetencyFormByIdAsync(string id);
    Task<IEnumerable<CompetencyFormDto>> GetCompetencyFormsByDepartmentAsync(string departmentId);
    Task<IEnumerable<CompetencyFormDto>> GetAllCompetencyFormsAsync();
    Task<Evaluation360Dto> Create360RequestAsync(Create360Request request);
    Task<Evaluation360Dto> Submit360ScoresAsync(string evaluationId, Submit360ScoresRequest request);
    Task<IEnumerable<Evaluation360Dto>> Get360EvaluationsForEmployeeAsync(string employeeId, string period);
    Task<IEnumerable<Evaluation360Dto>> Get360EvaluationsByEvaluatorAsync(string evaluatorId);
    Task<Evaluation360Dto> Get360EvaluationByIdAsync(string id);
}
