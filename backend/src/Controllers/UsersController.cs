namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<UserDto>>>> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var users = await _userService.GetPagedUsersAsync(page, pageSize);
        return Ok(ApiResponse<PaginatedResponse<UserDto>>.SuccessResponse(users, "Users retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(string id)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (id != currentUserId && !User.IsInRole("Admin") && !User.IsInRole("HR"))
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Unauthorized to view this user"));

        var user = await _userService.GetUserByIdAsync(id);
        return Ok(ApiResponse<UserDto>.SuccessResponse(user, "User retrieved successfully"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<UserDto>.ErrorResponse("Invalid input"));

        var user = await _userService.CreateUserAsync(request);
        return Created("", ApiResponse<UserDto>.SuccessResponse(user, "User created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<UserDto>.ErrorResponse("Invalid input"));

        var user = await _userService.UpdateUserAsync(id, request);
        return Ok(ApiResponse<UserDto>.SuccessResponse(user, "User updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "User deleted successfully"));
    }

    [HttpGet("birthdays")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetUpcomingBirthdays([FromQuery] int days = 30)
    {
        var users = await _userService.GetUpcomingBirthdaysAsync(days);
        return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(users, "Upcoming birthdays retrieved"));
    }
}
