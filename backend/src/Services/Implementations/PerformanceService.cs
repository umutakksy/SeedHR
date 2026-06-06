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

    // 360 Degree evaluations and rubrics
    public async Task<CompetencyFormDto> CreateCompetencyFormAsync(CreateCompetencyFormRequest request)
    {
        var form = _mapper.Map<CompetencyForm>(request);
        form.CreatedAt = DateTime.UtcNow;
        form.IsActive = true;

        // Populate competencies sub-items unique IDs if missing
        foreach (var comp in form.Competencies)
        {
            if (string.IsNullOrEmpty(comp.Id))
            {
                comp.Id = Guid.NewGuid().ToString("N");
            }
        }

        await _unitOfWork.CompetencyForms.AddAsync(form);
        await _unitOfWork.SaveChangesAsync();

        if (form.DepartmentId != null)
        {
            form.Department = await _unitOfWork.Departments.GetByIdAsync(form.DepartmentId);
        }

        return _mapper.Map<CompetencyFormDto>(form);
    }

    public async Task<CompetencyFormDto> GetCompetencyFormByIdAsync(string id)
    {
        var form = await _unitOfWork.CompetencyForms.GetByIdAsync(id)
            ?? throw new NotFoundException($"Competency form with ID {id} not found");

        if (form.DepartmentId != null)
        {
            form.Department = await _unitOfWork.Departments.GetByIdAsync(form.DepartmentId);
        }

        return _mapper.Map<CompetencyFormDto>(form);
    }

    public async Task<IEnumerable<CompetencyFormDto>> GetCompetencyFormsByDepartmentAsync(string departmentId)
    {
        var forms = await _unitOfWork.CompetencyForms.GetByDepartmentAsync(departmentId);
        foreach (var form in forms)
        {
            if (form.DepartmentId != null)
            {
                form.Department = await _unitOfWork.Departments.GetByIdAsync(form.DepartmentId);
            }
        }
        return _mapper.Map<IEnumerable<CompetencyFormDto>>(forms);
    }

    public async Task<IEnumerable<CompetencyFormDto>> GetAllCompetencyFormsAsync()
    {
        var forms = await _unitOfWork.CompetencyForms.GetAllAsync();
        var activeForms = forms.Where(f => f.IsActive);
        foreach (var form in activeForms)
        {
            if (form.DepartmentId != null)
            {
                form.Department = await _unitOfWork.Departments.GetByIdAsync(form.DepartmentId);
            }
        }
        return _mapper.Map<IEnumerable<CompetencyFormDto>>(activeForms);
    }

    public async Task<Evaluation360Dto> Create360RequestAsync(Create360Request request)
    {
        var employee = await _unitOfWork.Users.GetByIdAsync(request.EmployeeId)
            ?? throw new NotFoundException($"Employee with ID {request.EmployeeId} not found");

        var evaluator = await _unitOfWork.Users.GetByIdAsync(request.EvaluatorId)
            ?? throw new NotFoundException($"Evaluator with ID {request.EvaluatorId} not found");

        var form = await _unitOfWork.CompetencyForms.GetByIdAsync(request.CompetencyFormId)
            ?? throw new NotFoundException($"Competency form with ID {request.CompetencyFormId} not found");

        var evaluation = _mapper.Map<Evaluation360>(request);
        evaluation.CreatedAt = DateTime.UtcNow;
        evaluation.IsActive = true;
        evaluation.Status = "Draft";

        await _unitOfWork.Evaluations360.AddAsync(evaluation);

        // Notify the evaluator
        var notification = new Notification
        {
            UserId = request.EvaluatorId,
            Title = "360° Performans Değerlendirme Talebi",
            Message = $"'{employee.FullName}' çalışanı için 360 derece performans değerlendirmesini tamamlamanız beklenmektedir.",
            Type = "Info",
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        await _unitOfWork.Notifications.AddAsync(notification);

        await _unitOfWork.SaveChangesAsync();

        evaluation.Employee = employee;
        evaluation.Evaluator = evaluator;
        evaluation.CompetencyForm = form;

        return _mapper.Map<Evaluation360Dto>(evaluation);
    }

    public async Task<Evaluation360Dto> Submit360ScoresAsync(string evaluationId, Submit360ScoresRequest request)
    {
        var evaluation = await _unitOfWork.Evaluations360.GetByIdAsync(evaluationId)
            ?? throw new NotFoundException($"360 evaluation request with ID {evaluationId} not found");

        evaluation.Scores = request.Scores;
        evaluation.Feedback = request.Feedback;
        evaluation.Status = "Submitted";
        evaluation.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Evaluations360.UpdateAsync(evaluation);

        // Notify the employee that they received feedback
        var employee = await _unitOfWork.Users.GetByIdAsync(evaluation.EmployeeId);
        if (employee != null)
        {
            var notification = new Notification
            {
                UserId = evaluation.EmployeeId,
                Title = "Performans Değerlendirmesi Gönderildi",
                Message = $"'{evaluation.Period}' dönemi için 360 derece değerlendirme geribildiriminiz sisteme işlenmiştir.",
                Type = "Success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _unitOfWork.Notifications.AddAsync(notification);
        }

        await _unitOfWork.SaveChangesAsync();

        // Load navigations
        evaluation.Employee = employee;
        evaluation.Evaluator = await _unitOfWork.Users.GetByIdAsync(evaluation.EvaluatorId);
        evaluation.CompetencyForm = await _unitOfWork.CompetencyForms.GetByIdAsync(evaluation.CompetencyFormId);

        return _mapper.Map<Evaluation360Dto>(evaluation);
    }

    public async Task<IEnumerable<Evaluation360Dto>> Get360EvaluationsForEmployeeAsync(string employeeId, string period)
    {
        var evaluations = await _unitOfWork.Evaluations360.GetEvaluationsForEmployeeAsync(employeeId, period);
        var list = new List<Evaluation360Dto>();
        foreach (var ev in evaluations)
        {
            ev.Employee = await _unitOfWork.Users.GetByIdAsync(ev.EmployeeId);
            ev.Evaluator = await _unitOfWork.Users.GetByIdAsync(ev.EvaluatorId);
            ev.CompetencyForm = await _unitOfWork.CompetencyForms.GetByIdAsync(ev.CompetencyFormId);
            list.Add(_mapper.Map<Evaluation360Dto>(ev));
        }
        return list;
    }

    public async Task<IEnumerable<Evaluation360Dto>> Get360EvaluationsByEvaluatorAsync(string evaluatorId)
    {
        var evaluations = await _unitOfWork.Evaluations360.GetEvaluationsByEvaluatorAsync(evaluatorId);
        var list = new List<Evaluation360Dto>();
        foreach (var ev in evaluations)
        {
            ev.Employee = await _unitOfWork.Users.GetByIdAsync(ev.EmployeeId);
            ev.Evaluator = await _unitOfWork.Users.GetByIdAsync(ev.EvaluatorId);
            ev.CompetencyForm = await _unitOfWork.CompetencyForms.GetByIdAsync(ev.CompetencyFormId);
            list.Add(_mapper.Map<Evaluation360Dto>(ev));
        }
        return list;
    }

    public async Task<Evaluation360Dto> Get360EvaluationByIdAsync(string id)
    {
        var ev = await _unitOfWork.Evaluations360.GetByIdAsync(id)
            ?? throw new NotFoundException($"360 evaluation with ID {id} not found");

        ev.Employee = await _unitOfWork.Users.GetByIdAsync(ev.EmployeeId);
        ev.Evaluator = await _unitOfWork.Users.GetByIdAsync(ev.EvaluatorId);
        ev.CompetencyForm = await _unitOfWork.CompetencyForms.GetByIdAsync(ev.CompetencyFormId);

        return _mapper.Map<Evaluation360Dto>(ev);
    }
}
