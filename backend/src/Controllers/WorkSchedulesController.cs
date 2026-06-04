namespace SeedHR.Backend.Controllers;

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,HR")]
public class WorkSchedulesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public WorkSchedulesController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<WorkScheduleDto>>>> GetAllSchedules()
    {
        var schedules = await _unitOfWork.WorkSchedules.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<WorkScheduleDto>>(schedules);
        return Ok(ApiResponse<IEnumerable<WorkScheduleDto>>.SuccessResponse(dtos, "Work schedules retrieved successfully"));
    }

    [HttpGet("range")]
    public async Task<ActionResult<ApiResponse<IEnumerable<WorkScheduleDto>>>> GetSchedulesByRange([FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        var schedules = await _unitOfWork.WorkSchedules.FindAsync(w => w.Date >= start && w.Date <= end);
        var dtos = _mapper.Map<IEnumerable<WorkScheduleDto>>(schedules);
        return Ok(ApiResponse<IEnumerable<WorkScheduleDto>>.SuccessResponse(dtos, "Work schedules retrieved successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WorkScheduleDto>>> CreateSchedule([FromBody] CreateWorkScheduleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<WorkScheduleDto>.ErrorResponse("Invalid input"));

        var schedule = _mapper.Map<WorkSchedule>(request);
        schedule.IsActive = true;

        var created = await _unitOfWork.WorkSchedules.AddAsync(schedule);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<WorkScheduleDto>(created);
        return Created("", ApiResponse<WorkScheduleDto>.SuccessResponse(dto, "Work schedule created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<WorkScheduleDto>>> UpdateSchedule(string id, [FromBody] CreateWorkScheduleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<WorkScheduleDto>.ErrorResponse("Invalid input"));

        var schedule = await _unitOfWork.WorkSchedules.GetByIdAsync(id);
        if (schedule == null)
            return NotFound(ApiResponse<WorkScheduleDto>.ErrorResponse("Work schedule not found"));

        schedule.Date = request.Date;
        schedule.Type = request.Type;
        schedule.Description = request.Description;
        schedule.DayOfWeek = request.DayOfWeek;

        var updated = await _unitOfWork.WorkSchedules.UpdateAsync(schedule);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<WorkScheduleDto>(updated);
        return Ok(ApiResponse<WorkScheduleDto>.SuccessResponse(dto, "Work schedule updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteSchedule(string id)
    {
        var schedule = await _unitOfWork.WorkSchedules.GetByIdAsync(id);
        if (schedule == null)
            return NotFound(ApiResponse<bool>.ErrorResponse("Work schedule not found"));

        var result = await _unitOfWork.WorkSchedules.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(result, "Work schedule deleted successfully"));
    }
}
