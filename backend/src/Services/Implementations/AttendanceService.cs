namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class AttendanceService : IAttendanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AttendanceService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AttendanceDto> CheckInAsync(string userId, string? notes = null)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var today = DateTime.UtcNow.Date;
        var existingAttendance = await _unitOfWork.Attendances.GetByUserAndDateAsync(userId, today);

        if (existingAttendance != null)
            throw new ConflictException("You have already checked in today");

        // Determine if late based on local time (UTC+3)
        var localTime = DateTime.UtcNow.AddHours(3);
        var isLate = localTime.Hour > 9 || (localTime.Hour == 9 && localTime.Minute > 0);

        var attendance = new Attendance
        {
            UserId = userId,
            WorkScheduleId = "default",
            CheckInTime = DateTime.UtcNow,
            Status = isLate ? "Late" : "Present",
            Notes = notes
        };

        var created = await _unitOfWork.Attendances.AddAsync(attendance);
        await _unitOfWork.SaveChangesAsync();
        await PopulateUserAsync(created);
        return _mapper.Map<AttendanceDto>(created);
    }

    public async Task<AttendanceDto> CheckOutAsync(string userId)
    {
        var today = DateTime.UtcNow.Date;
        var attendance = await _unitOfWork.Attendances.GetByUserAndDateAsync(userId, today)
            ?? throw new NotFoundException("No check-in record found for today");

        if (attendance.CheckOutTime.HasValue)
            throw new ConflictException("You have already checked out today");

        attendance.CheckOutTime = DateTime.UtcNow;
        var updated = await _unitOfWork.Attendances.UpdateAsync(attendance);
        await _unitOfWork.SaveChangesAsync();
        await PopulateUserAsync(updated);
        return _mapper.Map<AttendanceDto>(updated);
    }

    public async Task<AttendanceDto?> GetAttendanceRecordAsync(string userId, DateTime date)
    {
        var attendance = await _unitOfWork.Attendances.GetByUserAndDateAsync(userId, date.Date);
        if (attendance != null)
        {
            await PopulateUserAsync(attendance);
        }
        return attendance != null ? _mapper.Map<AttendanceDto>(attendance) : null;
    }

    public async Task<IEnumerable<AttendanceDto>> GetUserAttendanceAsync(string userId, DateTime startDate, DateTime endDate)
    {
        List<Attendance> records;
        if (startDate == DateTime.MinValue && endDate == DateTime.MaxValue)
        {
            records = (await _unitOfWork.Attendances.GetByUserAsync(userId)).ToList();
        }
        else
        {
            records = (await _unitOfWork.Attendances.GetByUserDateRangeAsync(userId, startDate, endDate)).ToList();
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user != null)
        {
            foreach (var r in records)
            {
                r.User = user;
            }
        }
        return _mapper.Map<IEnumerable<AttendanceDto>>(records);
    }

    public async Task<IEnumerable<AttendanceDto>> GetAllAttendanceAsync()
    {
        var attendanceRecords = (await _unitOfWork.Attendances.GetAllAsync()).ToList();
        if (attendanceRecords.Any())
        {
            var users = (await _unitOfWork.Users.GetAllAsync()).ToDictionary(u => u.Id);
            foreach (var r in attendanceRecords)
            {
                if (!string.IsNullOrEmpty(r.UserId) && users.TryGetValue(r.UserId, out var user))
                {
                    r.User = user;
                }
            }
        }
        return _mapper.Map<IEnumerable<AttendanceDto>>(attendanceRecords);
    }

    private async Task PopulateUserAsync(Attendance record)
    {
        if (record != null && !string.IsNullOrEmpty(record.UserId) && record.User == null)
        {
            record.User = await _unitOfWork.Users.GetByIdAsync(record.UserId);
        }
    }
}
