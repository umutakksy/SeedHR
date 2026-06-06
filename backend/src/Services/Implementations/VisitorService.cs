using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Implementations;

public class VisitorService : IVisitorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public VisitorService(IUnitOfWork unitOfWork, INotificationService notificationService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<VisitorLogDto> CreateVisitorLogAsync(CreateVisitorLogRequest request)
    {
        var hostUser = await _unitOfWork.Users.GetByIdAsync(request.HostUserId)
            ?? throw new NotFoundException($"Host employee with ID {request.HostUserId} not found");

        var log = new VisitorLog
        {
            VisitorName = request.VisitorName,
            Company = request.Company,
            Purpose = request.Purpose,
            HostUserId = request.HostUserId,
            HostUserName = hostUser.FullName,
            Status = "Expected",
            BadgeNumber = request.BadgeNumber
        };

        var created = await _unitOfWork.VisitorLogs.AddAsync(log);
        await _unitOfWork.SaveChangesAsync();

        // Notify Host Employee about their visitor
        await _notificationService.CreateNotificationAsync(
            request.HostUserId,
            "Yeni Ziyaretçi Kaydı",
            $"{request.VisitorName} ({request.Company ?? "Belirtilmemiş"}) isimli misafiriniz için bir ziyaretçi kaydı oluşturuldu.",
            "Info",
            created.Id,
            "Visitor"
        );

        var dto = _mapper.Map<VisitorLogDto>(created);
        return dto;
    }

    public async Task<VisitorLogDto> GetVisitorByIdAsync(string id)
    {
        var log = await _unitOfWork.VisitorLogs.GetByIdAsync(id)
            ?? throw new NotFoundException($"Visitor log with ID {id} not found");

        return _mapper.Map<VisitorLogDto>(log);
    }

    public async Task<IEnumerable<VisitorLogDto>> GetActiveVisitorLogsAsync()
    {
        var list = await _unitOfWork.VisitorLogs.GetActiveVisitorLogsAsync();
        return _mapper.Map<IEnumerable<VisitorLogDto>>(list);
    }

    public async Task<IEnumerable<VisitorLogDto>> GetAllVisitorLogsAsync()
    {
        var list = await _unitOfWork.VisitorLogs.GetAllAsync();
        return _mapper.Map<IEnumerable<VisitorLogDto>>(list);
    }

    public async Task<VisitorLogDto> CheckInVisitorAsync(string id)
    {
        var log = await _unitOfWork.VisitorLogs.GetByIdAsync(id)
            ?? throw new NotFoundException($"Visitor log with ID {id} not found");

        log.Status = "CheckedIn";
        log.EntryTime = DateTime.UtcNow;

        await _unitOfWork.VisitorLogs.UpdateAsync(log);
        await _unitOfWork.SaveChangesAsync();

        // Send high priority notification to host that their visitor has arrived at the reception
        await _notificationService.CreateNotificationAsync(
            log.HostUserId,
            "Ziyaretçiniz Geldi!",
            $"{log.VisitorName} resepsiyona giriş yaptı ve sizinle görüşmeyi bekliyor.",
            "Success",
            log.Id,
            "Visitor"
        );

        return _mapper.Map<VisitorLogDto>(log);
    }

    public async Task<VisitorLogDto> CheckOutVisitorAsync(string id)
    {
        var log = await _unitOfWork.VisitorLogs.GetByIdAsync(id)
            ?? throw new NotFoundException($"Visitor log with ID {id} not found");

        log.Status = "CheckedOut";
        log.ExitTime = DateTime.UtcNow;

        await _unitOfWork.VisitorLogs.UpdateAsync(log);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<VisitorLogDto>(log);
    }
}
