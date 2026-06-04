namespace SeedHR.Backend.Services.Interfaces;

using SeedHR.Backend.Models.DTOs;

public interface IUserService
{
    Task<UserDto> GetUserByIdAsync(string id);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<IEnumerable<UserDto>> GetUsersByDepartmentAsync(string departmentId);
    Task<IEnumerable<UserDto>> GetUsersByPositionAsync(string positionId);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto> UpdateUserAsync(string id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(string id);
    Task<IEnumerable<UserDto>> GetUpcomingBirthdaysAsync(int days = 30);
}
