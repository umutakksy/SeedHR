namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;

public interface IPerformanceGoalRepository : IRepository<PerformanceGoal>
{
    Task<IEnumerable<PerformanceGoal>> GetByUserAsync(string userId);
}

public interface IPerformanceEvaluationRepository : IRepository<PerformanceEvaluation>
{
    Task<IEnumerable<PerformanceEvaluation>> GetByUserAsync(string userId);
    Task<IEnumerable<PerformanceEvaluation>> GetByPeriodAsync(string period);
}
