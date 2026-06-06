using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface ICourseRepository : IRepository<Course>
{
    Task<IEnumerable<Course>> GetActiveCoursesAsync();
}

public interface ICourseAssignmentRepository : IRepository<CourseAssignment>
{
    Task<IEnumerable<CourseAssignment>> GetAssignmentsByUserAsync(string userId);
    Task<IEnumerable<CourseAssignment>> GetAssignmentsByCourseAsync(string courseId);
    Task<CourseAssignment?> GetAssignmentAsync(string userId, string courseId);
}
