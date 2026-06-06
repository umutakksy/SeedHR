using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface ILmsService
{
    Task<CourseDto> CreateCourseAsync(CreateCourseRequest request);
    Task<CourseDto> GetCourseByIdAsync(string id);
    Task<IEnumerable<CourseDto>> GetAllCoursesAsync();
    Task<IEnumerable<CourseDto>> GetActiveCoursesAsync();
    Task<bool> DeleteCourseAsync(string id);

    Task<CourseAssignmentDto> AssignCourseAsync(string assignedBy, AssignCourseRequest request);
    Task<CourseAssignmentDto> CompleteCourseAsync(string assignmentId, string? certificateUrl);
    Task<IEnumerable<CourseAssignmentDto>> GetUserAssignmentsAsync(string userId);
    Task<IEnumerable<CourseAssignmentDto>> GetCourseAssignmentsAsync(string courseId);
    Task<IEnumerable<CourseAssignmentDto>> GetAllAssignmentsAsync();
}
