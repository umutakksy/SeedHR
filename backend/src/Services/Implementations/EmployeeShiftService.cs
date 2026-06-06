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

public class EmployeeShiftService : IEmployeeShiftService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public EmployeeShiftService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<EmployeeShiftDto> AssignShiftAsync(CreateEmployeeShiftRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId)
            ?? throw new NotFoundException($"User with ID {request.UserId} not found");

        // Check if there is an existing shift assignment on this date
        var existing = await _unitOfWork.EmployeeShifts.GetShiftByUserAndDateAsync(request.UserId, request.Date);
        if (existing != null)
        {
            await _unitOfWork.EmployeeShifts.DeleteAsync(existing.Id);
        }

        var shift = new EmployeeShift
        {
            UserId = request.UserId,
            Date = request.Date.Date,
            ShiftType = request.ShiftType,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Notes = request.Notes
        };

        var created = await _unitOfWork.EmployeeShifts.AddAsync(shift);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<EmployeeShiftDto>(created);
        dto.UserFullName = user.FullName;
        return dto;
    }

    public async Task<IEnumerable<EmployeeShiftDto>> GetShiftsByUserAsync(string userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var list = await _unitOfWork.EmployeeShifts.GetShiftsByUserAsync(userId);
        var dtos = new List<EmployeeShiftDto>();
        foreach (var s in list)
        {
            var dto = _mapper.Map<EmployeeShiftDto>(s);
            dto.UserFullName = user.FullName;
            dtos.Add(dto);
        }
        return dtos;
    }

    public async Task<IEnumerable<EmployeeShiftDto>> GetShiftsByDateRangeAsync(DateTime start, DateTime end)
    {
        var list = await _unitOfWork.EmployeeShifts.GetShiftsByDateRangeAsync(start, end);
        var dtos = new List<EmployeeShiftDto>();
        foreach (var s in list)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(s.UserId);
            var dto = _mapper.Map<EmployeeShiftDto>(s);
            dto.UserFullName = user?.FullName ?? "Unknown User";
            dtos.Add(dto);
        }
        return dtos;
    }
}
