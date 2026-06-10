namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
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
    private readonly IMemoryCache _cache;

    public LeaveService(IUnitOfWork unitOfWork, INotificationService notificationService, IMapper mapper, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
        _cache = cache;
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
        await PopulateNavigationPropertiesAsync(created);

        // Find user's manager or users in HR role
        var managers = await _unitOfWork.Users.FindAsync(u => u.RoleId == "role_hr" || (!string.IsNullOrEmpty(user.ManagerId) && u.Id == user.ManagerId));
        foreach (var manager in managers)
        {
            await _notificationService.CreateNotificationAsync(
                manager.Id,
                "Yeni İzin Talebi",
                $"{user.FullName} izin talebinde bulundu ({request.DaysRequested} gün, {request.StartDate:dd.MM.yyyy}–{request.EndDate:dd.MM.yyyy})",
                "LeaveRequest", created.Id, "LeaveRequest"
            );
        }

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
        await PopulateNavigationPropertiesAsync(updated);

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
        await PopulateNavigationPropertiesAsync(updated);

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
        await PopulateNavigationPropertiesAsync(leaveRequest);
        return _mapper.Map<LeaveRequestDto>(leaveRequest);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetUserLeaveRequestsAsync(string userId)
    {
        var leaveRequests = (await _unitOfWork.LeaveRequests.GetByUserAsync(userId)).ToList();
        await PopulateNavigationPropertiesBulkAsync(leaveRequests);
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(leaveRequests);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetPendingLeaveRequestsAsync()
    {
        var leaveRequests = (await _unitOfWork.LeaveRequests.GetByStatusAsync("Pending")).ToList();
        await PopulateNavigationPropertiesBulkAsync(leaveRequests);
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
        balance.User = await _unitOfWork.Users.GetByIdAsync(userId);
        balance.LeaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(leaveTypeId);
        return _mapper.Map<LeaveBalanceDto>(balance);
    }

    public async Task<IEnumerable<LeaveBalanceDto>> GetUserLeaveBalancesAsync(string userId)
    {
        var balances = (await _unitOfWork.LeaveBalances.GetByUserAsync(userId)).ToList();
        if (balances.Any())
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            var types = (await _unitOfWork.LeaveTypes.GetAllAsync()).ToDictionary(t => t.Id);
            foreach (var b in balances)
            {
                b.User = user;
                if (!string.IsNullOrEmpty(b.LeaveTypeId) && types.TryGetValue(b.LeaveTypeId, out var type))
                    b.LeaveType = type;
            }
        }
        return _mapper.Map<IEnumerable<LeaveBalanceDto>>(balances);
    }

    public async Task<IEnumerable<LeaveTypeDto>> GetLeaveTypesAsync()
    {
        return await _cache.GetOrCreateAsync("leave_types_all", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            var leaveTypes = await _unitOfWork.LeaveTypes.GetAllAsync();
            return _mapper.Map<IEnumerable<LeaveTypeDto>>(leaveTypes);
        }) ?? Array.Empty<LeaveTypeDto>();
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetUpcomingLeavesAsync(int days = 30)
    {
        var futureDate = DateTime.UtcNow.AddDays(days);
        var leaveRequests = await _unitOfWork.LeaveRequests.GetByDateRangeAsync(DateTime.UtcNow, futureDate);
        var approved = leaveRequests.Where(lr => lr.Status == "Approved").ToList();
        await PopulateNavigationPropertiesBulkAsync(approved);
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(approved);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetAllLeaveRequestsAsync()
    {
        var leaveRequests = (await _unitOfWork.LeaveRequests.GetAllAsync()).ToList();
        await PopulateNavigationPropertiesBulkAsync(leaveRequests);
        return _mapper.Map<IEnumerable<LeaveRequestDto>>(leaveRequests);
    }

    public async Task<PaginatedResponse<LeaveRequestDto>> GetPagedLeaveRequestsAsync(int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.LeaveRequests.GetPagedAsync(null, page, pageSize, r => r.CreatedAt, true);
        var itemList = items.ToList();
        await PopulateNavigationPropertiesBulkAsync(itemList);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PaginatedResponse<LeaveRequestDto>
        {
            Items = _mapper.Map<List<LeaveRequestDto>>(itemList),
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<PaginatedResponse<LeaveRequestDto>> GetPagedUserLeaveRequestsAsync(string userId, int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.LeaveRequests.GetPagedAsync(r => r.UserId == userId, page, pageSize, r => r.CreatedAt, true);
        var itemList = items.ToList();
        await PopulateNavigationPropertiesBulkAsync(itemList);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PaginatedResponse<LeaveRequestDto>
        {
            Items = _mapper.Map<List<LeaveRequestDto>>(itemList),
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }


    private async Task PopulateNavigationPropertiesAsync(LeaveRequest r)
    {
        if (r == null) return;
        if (!string.IsNullOrEmpty(r.UserId) && r.User == null)
            r.User = await _unitOfWork.Users.GetByIdAsync(r.UserId);
        if (!string.IsNullOrEmpty(r.LeaveTypeId) && r.LeaveType == null)
            r.LeaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(r.LeaveTypeId);
    }

    private async Task PopulateNavigationPropertiesBulkAsync(List<LeaveRequest> requests)
    {
        if (requests == null || requests.Count == 0) return;

        var users = (await _unitOfWork.Users.GetAllAsync()).ToDictionary(u => u.Id);
        var leaveTypes = (await _unitOfWork.LeaveTypes.GetAllAsync()).ToDictionary(t => t.Id);

        foreach (var r in requests)
        {
            if (!string.IsNullOrEmpty(r.UserId) && users.TryGetValue(r.UserId, out var user))
                r.User = user;

            if (!string.IsNullOrEmpty(r.LeaveTypeId) && leaveTypes.TryGetValue(r.LeaveTypeId, out var type))
                r.LeaveType = type;
        }
    }
}
