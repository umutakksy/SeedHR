namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class LeaveService : ILeaveService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public LeaveService(IUnitOfWork unitOfWork, INotificationService notificationService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<LeaveRequestDto> CreateLeaveRequestAsync(string userId, CreateLeaveRequestRequest request)
    {
        if (request.StartDate >= request.EndDate)
            throw new ValidationException("Start date must be before end date");

        if (request.DaysRequested <= 0)
            throw new ValidationException("Days requested must be greater than 0");

        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(request.LeaveTypeId)
            ?? throw new NotFoundException($"Leave type with ID {request.LeaveTypeId} not found");

        var balance = await _unitOfWork.LeaveBalances.GetByUserAndTypeAsync(userId, request.LeaveTypeId);
        if (balance == null || balance.RemainingDays < request.DaysRequested)
            throw new ConflictException("Insufficient leave balance");

        var overlapping = await _unitOfWork.LeaveRequests.GetOverlappingAsync(userId, request.StartDate, request.EndDate);
        if (overlapping.Any())
            throw new ConflictException("Leave dates overlap with existing leave request");

        var leaveRequest = new LeaveRequest
        {
            UserId = userId,
            LeaveTypeId = request.LeaveTypeId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            DaysRequested = request.DaysRequested,
            Reason = request.Reason,
            Status = "Pending"
        };

        var created = await _unitOfWork.LeaveRequests.AddAsync(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<LeaveRequestDto>(created);
    }

    public async Task<LeaveRequestDto> ApproveLeaveRequestAsync(string leaveRequestId, string approverId)
    {
        var leaveRequest = await _unitOfWork.LeaveRequests.GetByIdAsync(leaveRequestId)
            ?? throw new NotFoundException($"Leave request with ID {leaveRequestId} not found");

        if (leaveRequest.Status != "Pending")
            throw new ConflictException("Only pending leave requests can be approved");

        var balance = await _unitOfWork.LeaveBalances.GetByUserAndTypeAsync(leaveRequest.UserId, leaveRequest.LeaveTypeId);
        if (balance != null)
        {
            balance.UsedDays += leaveRequest.DaysRequested;
            await _unitOfWork.LeaveBalances.UpdateAsync(balance);
        }

        leaveRequest.Status = "Approved";
        leaveRequest.ApprovedBy = approverId;
        leaveRequest.ApprovedDate = DateTime.UtcNow;

        var updated = await _unitOfWork.LeaveRequests.UpdateAsync(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            leaveRequest.UserId,
            "Leave Request Approved",
            $"Your leave request from {leaveRequest.StartDate:yyyy-MM-dd} to {leaveRequest.EndDate:yyyy-MM-dd} has been approved",
            "LeaveApproval",
            leaveRequestId,
            "LeaveRequest");

        return _mapper.Map<LeaveRequestDto>(updated);
    }

    public async Task<LeaveRequestDto> RejectLeaveRequestAsync(string leaveRequestId, string approverId, string reason)
    {
        var leaveRequest = await _unitOfWork.LeaveRequests.GetByIdAsync(leaveRequestId)
            ?? throw new NotFoundException($"Leave request with ID {leaveRequestId} not found");

        if (leaveRequest.Status != "Pending")
            throw new ConflictException("Only pending leave requests can be rejected");

        leaveRequest.Status = "Rejected";
        leaveRequest.ApprovedBy = approverId;
        leaveRequest.ApprovedDate = DateTime.UtcNow;
        leaveRequest.RejectionReason = reason;

        var updated = await _unitOfWork.LeaveRequests.UpdateAsync(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(
            leaveRequest.UserId,
            "Leave Request Rejected",
            $"Your leave request has been rejected. Reason: {reason}",
            "LeaveRejection",
            leaveRequestId,
            "LeaveRequest");

        return _mapper.Map<LeaveRequestDto>(updated);
    }

    public async Task<LeaveRequestDto> GetLeaveRequestByIdAsync(string id)
    {
        var leaveRequest = await _unitOfWork.LeaveRequests.GetByIdAsync(id)
            ?? throw new NotFoundException($"Leave request with ID {id} not found");
        return _mapper.Map<LeaveRequestDto>(leaveRequest);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetUserLeaveRequestsAsync(string userId)
    {
        var leaveRequests = await _unitOfWork.LeaveRequests.GetByUserAsync(userId);
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(leaveRequests);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetPendingLeaveRequestsAsync()
    {
        var leaveRequests = await _unitOfWork.LeaveRequests.GetByStatusAsync("Pending");
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(leaveRequests);
    }

    public async Task<bool> CancelLeaveRequestAsync(string leaveRequestId, string userId)
    {
        var leaveRequest = await _unitOfWork.LeaveRequests.GetByIdAsync(leaveRequestId)
            ?? throw new NotFoundException($"Leave request with ID {leaveRequestId} not found");

        if (leaveRequest.UserId != userId)
            throw new UnauthorizedException("You can only cancel your own leave requests");

        if (leaveRequest.Status != "Pending" && leaveRequest.Status != "Approved")
            throw new ConflictException("Only pending or approved leave requests can be cancelled");

        leaveRequest.Status = "Cancelled";
        await _unitOfWork.LeaveRequests.UpdateAsync(leaveRequest);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<LeaveBalanceDto> GetLeaveBalanceAsync(string userId, string leaveTypeId)
    {
        var balance = await _unitOfWork.LeaveBalances.GetByUserAndTypeAsync(userId, leaveTypeId)
            ?? throw new NotFoundException("Leave balance not found");
        return _mapper.Map<LeaveBalanceDto>(balance);
    }

    public async Task<IEnumerable<LeaveBalanceDto>> GetUserLeaveBalancesAsync(string userId)
    {
        var balances = await _unitOfWork.LeaveBalances.GetByUserAsync(userId);
        return _mapper.Map<IEnumerable<LeaveBalanceDto>>(balances);
    }

    public async Task<IEnumerable<LeaveTypeDto>> GetLeaveTypesAsync()
    {
        var leaveTypes = await _unitOfWork.LeaveTypes.GetAllAsync();
        return _mapper.Map<IEnumerable<LeaveTypeDto>>(leaveTypes);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetUpcomingLeavesAsync(int days = 30)
    {
        var futureDate = DateTime.UtcNow.AddDays(days);
        var leaveRequests = await _unitOfWork.LeaveRequests.GetByDateRangeAsync(DateTime.UtcNow, futureDate);
        var approved = leaveRequests.Where(lr => lr.Status == "Approved");
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(approved);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetAllLeaveRequestsAsync()
    {
        var leaveRequests = await _unitOfWork.LeaveRequests.GetAllAsync();
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(leaveRequests);
    }
}
