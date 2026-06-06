using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IOnboardingPlanRepository : IRepository<OnboardingPlan>
{
    Task<IEnumerable<OnboardingPlan>> GetPlansByDepartmentAsync(string departmentId);
    Task<IEnumerable<OnboardingPlan>> GetPlansByPositionAsync(string positionId);
}

public interface IOnboardingTaskRepository : IRepository<OnboardingTask>
{
    Task<IEnumerable<OnboardingTask>> GetTasksByPlanAsync(string planId);
}

public interface IOnboardingInstanceRepository : IRepository<OnboardingInstance>
{
    Task<OnboardingInstance?> GetActiveInstanceByUserAsync(string userId);
    Task<IEnumerable<OnboardingInstance>> GetInstancesByPlanAsync(string planId);
}

public interface IOnboardingTaskCompletionRepository : IRepository<OnboardingTaskCompletion>
{
    Task<IEnumerable<OnboardingTaskCompletion>> GetCompletionsByInstanceAsync(string instanceId);
    Task<OnboardingTaskCompletion?> GetCompletionByTaskAsync(string instanceId, string taskId);
}
