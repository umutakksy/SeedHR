using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Implementations;

public class LmsService : ILmsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public LmsService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseRequest request)
    {
        var course = _mapper.Map<Course>(request);
        course.CreatedAt = DateTime.UtcNow;
        course.IsActive = true;

        await _unitOfWork.Courses.AddAsync(course);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CourseDto>(course);
    }

    public async Task<CourseDto> GetCourseByIdAsync(string id)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(id);
        if (course == null || !course.IsActive)
            throw new KeyNotFoundException("Course not found");

        return _mapper.Map<CourseDto>(course);
    }

    public async Task<IEnumerable<CourseDto>> GetAllCoursesAsync()
    {
        var courses = await _unitOfWork.Courses.GetAllAsync();
        return _mapper.Map<IEnumerable<CourseDto>>(courses.Where(c => c.IsActive));
    }

    public async Task<IEnumerable<CourseDto>> GetActiveCoursesAsync()
    {
        var courses = await _unitOfWork.Courses.GetActiveCoursesAsync();
        return _mapper.Map<IEnumerable<CourseDto>>(courses);
    }

    public async Task<bool> DeleteCourseAsync(string id)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(id);
        if (course == null) return false;

        course.IsActive = false;
        course.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Courses.UpdateAsync(course);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<CourseAssignmentDto> AssignCourseAsync(string assignedBy, AssignCourseRequest request)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(request.CourseId);
        if (course == null || !course.IsActive)
            throw new KeyNotFoundException("Course not found");

        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
        if (user == null || !user.IsActive)
            throw new KeyNotFoundException("User not found");

        var existing = await _unitOfWork.CourseAssignments.GetAssignmentAsync(request.UserId, request.CourseId);
        if (existing != null)
        {
            return _mapper.Map<CourseAssignmentDto>(existing);
        }

        var assignment = new CourseAssignment
        {
            CourseId = request.CourseId,
            UserId = request.UserId,
            AssignedBy = assignedBy,
            AssignedDate = DateTime.UtcNow,
            Status = "Assigned",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _unitOfWork.CourseAssignments.AddAsync(assignment);
        
        // Notify the employee about the training assignment
        var notification = new Notification
        {
            UserId = request.UserId,
            Title = "Yeni Eğitim Atandı",
            Message = $"'{course.Title}' eğitimi İK tarafından size atanmıştır. Lütfen tamamlayınız.",
            Type = "Info",
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        await _unitOfWork.Notifications.AddAsync(notification);
        
        await _unitOfWork.SaveChangesAsync();

        // Populate navigation properties for mapping
        assignment.Course = course;
        assignment.User = user;
        
        var assignedByUser = await _unitOfWork.Users.GetByIdAsync(assignedBy);
        var dto = _mapper.Map<CourseAssignmentDto>(assignment);
        dto.AssignedByName = assignedByUser?.FullName ?? "Sistem";

        return dto;
    }

    public async Task<CourseAssignmentDto> CompleteCourseAsync(string assignmentId, string? certificateUrl)
    {
        var assignment = await _unitOfWork.CourseAssignments.GetByIdAsync(assignmentId);
        if (assignment == null || !assignment.IsActive)
            throw new KeyNotFoundException("Assignment not found");

        assignment.Status = "Completed";
        assignment.CompletedDate = DateTime.UtcNow;
        assignment.CertificateUrl = certificateUrl;
        assignment.UpdatedAt = DateTime.UtcNow;

        if (assignment.Course != null && assignment.Course.Title.Contains("Sertifikalı"))
        {
            assignment.CertificateExpiryDate = DateTime.UtcNow.AddYears(1); // Default 1 year validity
        }

        await _unitOfWork.CourseAssignments.UpdateAsync(assignment);
        await _unitOfWork.SaveChangesAsync();

        // Load navigations
        assignment.Course = await _unitOfWork.Courses.GetByIdAsync(assignment.CourseId);
        assignment.User = await _unitOfWork.Users.GetByIdAsync(assignment.UserId);
        
        var assignedByUser = await _unitOfWork.Users.GetByIdAsync(assignment.AssignedBy);
        var dto = _mapper.Map<CourseAssignmentDto>(assignment);
        dto.AssignedByName = assignedByUser?.FullName ?? "Sistem";

        return dto;
    }

    public async Task<IEnumerable<CourseAssignmentDto>> GetUserAssignmentsAsync(string userId)
    {
        var assignments = await _unitOfWork.CourseAssignments.GetAssignmentsByUserAsync(userId);
        var list = new List<CourseAssignmentDto>();
        foreach (var assignment in assignments)
        {
            assignment.Course = await _unitOfWork.Courses.GetByIdAsync(assignment.CourseId);
            assignment.User = await _unitOfWork.Users.GetByIdAsync(assignment.UserId);
            var assignedByUser = await _unitOfWork.Users.GetByIdAsync(assignment.AssignedBy);
            
            var dto = _mapper.Map<CourseAssignmentDto>(assignment);
            dto.AssignedByName = assignedByUser?.FullName ?? "Sistem";
            list.Add(dto);
        }
        return list;
    }

    public async Task<IEnumerable<CourseAssignmentDto>> GetCourseAssignmentsAsync(string courseId)
    {
        var assignments = await _unitOfWork.CourseAssignments.GetAssignmentsByCourseAsync(courseId);
        var list = new List<CourseAssignmentDto>();
        foreach (var assignment in assignments)
        {
            assignment.Course = await _unitOfWork.Courses.GetByIdAsync(assignment.CourseId);
            assignment.User = await _unitOfWork.Users.GetByIdAsync(assignment.UserId);
            var assignedByUser = await _unitOfWork.Users.GetByIdAsync(assignment.AssignedBy);
            
            var dto = _mapper.Map<CourseAssignmentDto>(assignment);
            dto.AssignedByName = assignedByUser?.FullName ?? "Sistem";
            list.Add(dto);
        }
        return list;
    }

    public async Task<IEnumerable<CourseAssignmentDto>> GetAllAssignmentsAsync()
    {
        var assignments = await _unitOfWork.CourseAssignments.GetAllAsync();
        var activeAssignments = assignments.Where(a => a.IsActive);
        var list = new List<CourseAssignmentDto>();
        foreach (var assignment in activeAssignments)
        {
            assignment.Course = await _unitOfWork.Courses.GetByIdAsync(assignment.CourseId);
            assignment.User = await _unitOfWork.Users.GetByIdAsync(assignment.UserId);
            var assignedByUser = await _unitOfWork.Users.GetByIdAsync(assignment.AssignedBy);
            
            var dto = _mapper.Map<CourseAssignmentDto>(assignment);
            dto.AssignedByName = assignedByUser?.FullName ?? "Sistem";
            list.Add(dto);
        }
        return list;
    }
}
