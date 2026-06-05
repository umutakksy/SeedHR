namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class PerformanceService : IPerformanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PerformanceService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PerformanceGoalDto> CreateGoalAsync(string userId, CreatePerformanceGoalRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var startDateOnly = request.StartDate.Date;
        var dueDateOnly = request.DueDate.Date;

        if (startDateOnly >= dueDateOnly)
            throw new ValidationException("Due date must be after start date");

        var goal = new PerformanceGoal
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            Status = "In Progress",
            TargetProgress = request.TargetProgress,
            CurrentProgress = 0
        };

        var created = await _unitOfWork.PerformanceGoals.AddAsync(goal);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<PerformanceGoalDto>(created);
    }

    public async Task<PerformanceGoalDto> GetGoalByIdAsync(string id)
    {
        var goal = await _unitOfWork.PerformanceGoals.GetByIdAsync(id)
            ?? throw new NotFoundException($"Performance goal with ID {id} not found");
        return _mapper.Map<PerformanceGoalDto>(goal);
    }

    public async Task<IEnumerable<PerformanceGoalDto>> GetUserGoalsAsync(string userId)
    {
        var goals = await _unitOfWork.PerformanceGoals.GetByUserAsync(userId);
        return _mapper.Map<IEnumerable<PerformanceGoalDto>>(goals);
    }

    public async Task<PerformanceGoalDto> UpdateGoalProgressAsync(string id, int progress)
    {
        if (progress < 0 || progress > 100)
            throw new ValidationException("Progress must be between 0 and 100");

        var goal = await _unitOfWork.PerformanceGoals.GetByIdAsync(id)
            ?? throw new NotFoundException($"Performance goal with ID {id} not found");

        goal.CurrentProgress = progress;
        if (progress == 100)
            goal.Status = "Completed";

        var updated = await _unitOfWork.PerformanceGoals.UpdateAsync(goal);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<PerformanceGoalDto>(updated);
    }

    public async Task<bool> DeleteGoalAsync(string id)
    {
        return await _unitOfWork.PerformanceGoals.DeleteAsync(id);
    }

    public async Task<PerformanceGoalDto> UpdateGoalStatusAsync(string id, string status)
    {
        var goal = await _unitOfWork.PerformanceGoals.GetByIdAsync(id)
            ?? throw new NotFoundException($"Performance goal with ID {id} not found");

        goal.Status = status;
        if (status == "Completed" || status == "Achieved")
        {
            goal.CurrentProgress = 100;
        }
        else if (status == "InProgress")
        {
            goal.Status = "InProgress";
            if (goal.CurrentProgress == 0) goal.CurrentProgress = 10;
        }

        var updated = await _unitOfWork.PerformanceGoals.UpdateAsync(goal);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<PerformanceGoalDto>(updated);
    }

    public async Task<PerformanceEvaluationDto> CreateEvaluationAsync(string evaluatorId, CreatePerformanceEvaluationRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
            throw new ValidationException("Rating must be between 1 and 5");

        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId)
            ?? throw new NotFoundException($"User with ID {request.UserId} not found");

        var evaluation = new PerformanceEvaluation
        {
            UserId = request.UserId,
            EvaluatedBy = evaluatorId,
            EvaluationDate = DateTime.UtcNow,
            Period = request.Period,
            Rating = request.Rating,
            Strengths = request.Strengths,
            AreasForImprovement = request.AreasForImprovement,
            Comments = request.Comments
        };

        var created = await _unitOfWork.PerformanceEvaluations.AddAsync(evaluation);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<PerformanceEvaluationDto>(created);
    }

    public async Task<PerformanceEvaluationDto> GetEvaluationByIdAsync(string id)
    {
        var evaluation = await _unitOfWork.PerformanceEvaluations.GetByIdAsync(id)
            ?? throw new NotFoundException($"Performance evaluation with ID {id} not found");
        return _mapper.Map<PerformanceEvaluationDto>(evaluation);
    }

    public async Task<IEnumerable<PerformanceEvaluationDto>> GetUserEvaluationsAsync(string userId)
    {
        var evaluations = await _unitOfWork.PerformanceEvaluations.GetByUserAsync(userId);
        return _mapper.Map<IEnumerable<PerformanceEvaluationDto>>(evaluations);
    }

    public async Task<IEnumerable<PerformanceEvaluationDto>> GetPeriodEvaluationsAsync(string period)
    {
        var evaluations = await _unitOfWork.PerformanceEvaluations.GetByPeriodAsync(period);
        return _mapper.Map<IEnumerable<PerformanceEvaluationDto>>(evaluations);
    }
}
