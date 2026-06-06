using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Implementations;

public class OnboardingService : IOnboardingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public OnboardingService(IUnitOfWork unitOfWork, IMapper mapper, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationService = notificationService;
    }

    public async Task<OnboardingPlanDto> CreatePlanAsync(CreateOnboardingPlanRequest request)
    {
        var plan = _mapper.Map<OnboardingPlan>(request);
        plan.Status = "Active";
        plan.IsActive = true;
        plan.CreatedAt = DateTime.UtcNow;

        var createdPlan = await _unitOfWork.OnboardingPlans.AddAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        var taskDtos = new List<OnboardingTaskDto>();
        if (request.Tasks != null && request.Tasks.Count > 0)
        {
            var tasks = request.Tasks.Select(t => new OnboardingTask
            {
                OnboardingPlanId = createdPlan.Id,
                Title = t.Title,
                Description = t.Description,
                Category = t.Category,
                DueDay = t.DueDay,
                AssignedToRole = t.AssignedToRole,
                IsMandatory = t.IsMandatory,
                Order = t.Order,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            var addedTasks = await _unitOfWork.OnboardingTasks.AddRangeAsync(tasks);
            await _unitOfWork.SaveChangesAsync();
            taskDtos = _mapper.Map<List<OnboardingTaskDto>>(addedTasks);
        }

        var dto = _mapper.Map<OnboardingPlanDto>(createdPlan);
        dto.Tasks = taskDtos;

        // Resolve Department and Position Names
        if (!string.IsNullOrEmpty(dto.DepartmentId))
        {
            var dept = await _unitOfWork.Departments.GetByIdAsync(dto.DepartmentId);
            dto.DepartmentName = dept?.Name;
        }
        if (!string.IsNullOrEmpty(dto.PositionId))
        {
            var pos = await _unitOfWork.Positions.GetByIdAsync(dto.PositionId);
            dto.PositionTitle = pos?.Title;
        }

        return dto;
    }

    public async Task<IEnumerable<OnboardingPlanDto>> GetPlansAsync()
    {
        var plans = (await _unitOfWork.OnboardingPlans.GetAllAsync()).Where(p => p.IsActive).ToList();
        var dtos = new List<OnboardingPlanDto>();

        var departments = (await _unitOfWork.Departments.GetAllAsync()).ToDictionary(d => d.Id);
        var positions = (await _unitOfWork.Positions.GetAllAsync()).ToDictionary(p => p.Id);

        foreach (var plan in plans)
        {
            var dto = _mapper.Map<OnboardingPlanDto>(plan);
            if (!string.IsNullOrEmpty(dto.DepartmentId) && departments.TryGetValue(dto.DepartmentId, out var dept))
                dto.DepartmentName = dept.Name;
            if (!string.IsNullOrEmpty(dto.PositionId) && positions.TryGetValue(dto.PositionId, out var pos))
                dto.PositionTitle = pos.Title;

            var tasks = await _unitOfWork.OnboardingTasks.GetTasksByPlanAsync(plan.Id);
            dto.Tasks = _mapper.Map<List<OnboardingTaskDto>>(tasks.OrderBy(t => t.Order));

            dtos.Add(dto);
        }

        return dtos;
    }

    public async Task<OnboardingPlanDto> GetPlanByIdAsync(string id)
    {
        var plan = await _unitOfWork.OnboardingPlans.GetByIdAsync(id)
            ?? throw new NotFoundException($"Onboarding plan with ID {id} not found");

        var dto = _mapper.Map<OnboardingPlanDto>(plan);
        if (!string.IsNullOrEmpty(dto.DepartmentId))
        {
            var dept = await _unitOfWork.Departments.GetByIdAsync(dto.DepartmentId);
            dto.DepartmentName = dept?.Name;
        }
        if (!string.IsNullOrEmpty(dto.PositionId))
        {
            var pos = await _unitOfWork.Positions.GetByIdAsync(dto.PositionId);
            dto.PositionTitle = pos?.Title;
        }

        var tasks = await _unitOfWork.OnboardingTasks.GetTasksByPlanAsync(id);
        dto.Tasks = _mapper.Map<List<OnboardingTaskDto>>(tasks.OrderBy(t => t.Order));

        return dto;
    }

    public async Task<OnboardingProgressDto> StartOnboardingAsync(string userId, string planId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var plan = await _unitOfWork.OnboardingPlans.GetByIdAsync(planId)
            ?? throw new NotFoundException($"Onboarding plan with ID {planId} not found");

        var activeInstance = await _unitOfWork.OnboardingInstances.GetActiveInstanceByUserAsync(userId);
        if (activeInstance != null)
        {
            throw new ConflictException("User already has an active onboarding process in progress.");
        }

        var instance = new OnboardingInstance
        {
            UserId = userId,
            OnboardingPlanId = planId,
            StartDate = DateTime.UtcNow,
            Status = "In Progress",
            ProgressPercentage = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createdInstance = await _unitOfWork.OnboardingInstances.AddAsync(instance);
        await _unitOfWork.SaveChangesAsync();

        var tasks = (await _unitOfWork.OnboardingTasks.GetTasksByPlanAsync(planId)).ToList();
        var completions = tasks.Select(t => new OnboardingTaskCompletion
        {
            OnboardingInstanceId = createdInstance.Id,
            TaskId = t.Id,
            UserId = userId,
            Status = "Pending",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _unitOfWork.OnboardingTaskCompletions.AddRangeAsync(completions);
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            userId,
            "Onboarding Süreciniz Başladı",
            $"'{plan.Name}' isimli uyum süreciniz başlatılmıştır. Lütfen görev listenizi kontrol ediniz.",
            "OnboardingStart",
            createdInstance.Id,
            "Onboarding");

        return await GetProgressAsync(userId);
    }

    public async Task<OnboardingProgressDto> GetProgressAsync(string userId)
    {
        var instance = await _unitOfWork.OnboardingInstances.GetActiveInstanceByUserAsync(userId);
        if (instance == null)
        {
            // Try to find completed one if active doesn't exist
            var allInstances = await _unitOfWork.OnboardingInstances.GetAllAsync();
            instance = allInstances.Where(oi => oi.UserId == userId && oi.IsActive).OrderByDescending(oi => oi.CreatedAt).FirstOrDefault();
            
            if (instance == null)
                throw new NotFoundException($"Active onboarding process not found for user with ID {userId}");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        var plan = await _unitOfWork.OnboardingPlans.GetByIdAsync(instance.OnboardingPlanId);
        var tasks = (await _unitOfWork.OnboardingTasks.GetTasksByPlanAsync(instance.OnboardingPlanId)).ToDictionary(t => t.Id);
        var completions = await _unitOfWork.OnboardingTaskCompletions.GetCompletionsByInstanceAsync(instance.Id);

        var dto = new OnboardingProgressDto
        {
            InstanceId = instance.Id,
            UserId = userId,
            UserName = user?.FullName ?? "",
            PlanId = instance.OnboardingPlanId,
            PlanName = plan?.Name ?? "",
            StartDate = instance.StartDate,
            CompletionDate = instance.CompletionDate,
            Status = instance.Status,
            ProgressPercentage = instance.ProgressPercentage
        };

        foreach (var comp in completions.OrderBy(c => tasks.TryGetValue(c.TaskId, out var t) ? t.Order : 0))
        {
            if (tasks.TryGetValue(comp.TaskId, out var task))
            {
                dto.Tasks.Add(new OnboardingTaskStatusDto
                {
                    TaskId = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Category = task.Category,
                    DueDay = task.DueDay,
                    AssignedToRole = task.AssignedToRole,
                    IsMandatory = task.IsMandatory,
                    CompletionStatus = comp.Status,
                    CompletionDate = comp.CompletionDate,
                    EvidenceUrl = comp.EvidenceUrl
                });
            }
        }

        return dto;
    }

    public async Task<OnboardingProgressDto> CompleteTaskAsync(string userId, string taskId, CompleteTaskRequest request)
    {
        var instance = await _unitOfWork.OnboardingInstances.GetActiveInstanceByUserAsync(userId)
            ?? throw new NotFoundException($"Active onboarding process not found for user with ID {userId}");

        var completion = await _unitOfWork.OnboardingTaskCompletions.GetCompletionByTaskAsync(instance.Id, taskId)
            ?? throw new NotFoundException($"Onboarding task completion record not found for task with ID {taskId}");

        if (completion.Status == "Completed")
        {
            throw new ConflictException("Task is already completed.");
        }

        completion.Status = "Completed";
        completion.CompletionDate = DateTime.UtcNow;
        completion.EvidenceUrl = request.EvidenceUrl;
        completion.Signature = request.Signature;
        completion.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.OnboardingTaskCompletions.UpdateAsync(completion);

        // Recalculate progress percentage
        var completions = (await _unitOfWork.OnboardingTaskCompletions.GetCompletionsByInstanceAsync(instance.Id)).ToList();
        var totalTasks = completions.Count;
        var completedTasks = completions.Count(c => c.Status == "Completed");

        instance.ProgressPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 100;
        if (instance.ProgressPercentage >= 100)
        {
            instance.Status = "Completed";
            instance.CompletionDate = DateTime.UtcNow;

            await _notificationService.CreateNotificationAsync(
                userId,
                "Onboarding Süreciniz Tamamlandı 🎉",
                $"Tebrikler! İşe alım uyum sürecinizdeki tüm görevleri başarıyla tamamladınız.",
                "OnboardingComplete",
                instance.Id,
                "Onboarding");
        }
        instance.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.OnboardingInstances.UpdateAsync(instance);
        await _unitOfWork.SaveChangesAsync();

        return await GetProgressAsync(userId);
    }

    public async Task<IEnumerable<OnboardingProgressDto>> GetActiveOnboardingsAsync()
    {
        var instances = (await _unitOfWork.OnboardingInstances.GetAllAsync())
            .Where(oi => oi.Status == "In Progress" && oi.IsActive).ToList();

        var users = (await _unitOfWork.Users.GetAllAsync()).ToDictionary(u => u.Id);
        var plans = (await _unitOfWork.OnboardingPlans.GetAllAsync()).ToDictionary(p => p.Id);

        var reportList = new List<OnboardingProgressDto>();

        foreach (var inst in instances)
        {
            var user = users.TryGetValue(inst.UserId, out var u) ? u : null;
            var plan = plans.TryGetValue(inst.OnboardingPlanId, out var p) ? p : null;

            reportList.Add(new OnboardingProgressDto
            {
                InstanceId = inst.Id,
                UserId = inst.UserId,
                UserName = user?.FullName ?? "",
                PlanId = inst.OnboardingPlanId,
                PlanName = plan?.Name ?? "",
                StartDate = inst.StartDate,
                Status = inst.Status,
                ProgressPercentage = inst.ProgressPercentage
            });
        }

        return reportList;
    }

    public async Task SendRemindersAsync()
    {
        var instances = (await _unitOfWork.OnboardingInstances.GetAllAsync())
            .Where(oi => oi.Status == "In Progress" && oi.IsActive).ToList();

        foreach (var inst in instances)
        {
            var completions = (await _unitOfWork.OnboardingTaskCompletions.GetCompletionsByInstanceAsync(inst.Id))
                .Where(c => c.Status == "Pending").ToList();

            var tasks = (await _unitOfWork.OnboardingTasks.GetTasksByPlanAsync(inst.OnboardingPlanId)).ToDictionary(t => t.Id);

            foreach (var comp in completions)
            {
                if (tasks.TryGetValue(comp.TaskId, out var task))
                {
                    var taskDueDate = inst.StartDate.AddDays(task.DueDay);
                    if (taskDueDate < DateTime.UtcNow)
                    {
                        // Overdue task! Send reminder.
                        string targetUserId = inst.UserId; // Default is the employee
                        
                        if (task.AssignedToRole == "Manager")
                        {
                            var employee = await _unitOfWork.Users.GetByIdAsync(inst.UserId);
                            if (employee != null && !string.IsNullOrEmpty(employee.ManagerId))
                            {
                                targetUserId = employee.ManagerId;
                            }
                        }
                        else if (task.AssignedToRole == "IT" || task.AssignedToRole == "HR")
                        {
                            // In real system we'd send to the IT department or HR team users.
                            // For simplicity, notify employee or admin
                            targetUserId = inst.UserId;
                        }

                        await _notificationService.CreateNotificationAsync(
                            targetUserId,
                            "Gecikmiş Onboarding Görevi Hatırlatması",
                            $"'{task.Title}' görevinin teslim tarihi geçmiştir. Lütfen en kısa sürede tamamlayınız.",
                            "OnboardingReminder",
                            inst.Id,
                            "Onboarding");
                    }
                }
            }
        }
    }
}
