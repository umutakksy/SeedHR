namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,HR")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly IUserService _userService;

    public DepartmentsController(IDepartmentService departmentService, IUserService userService)
    {
        _departmentService = departmentService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<DepartmentDto>>>> GetAllDepartments()
    {
        var departments = await _departmentService.GetAllDepartmentsAsync();
        return Ok(ApiResponse<IEnumerable<DepartmentDto>>.SuccessResponse(departments, "Departments retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetDepartmentById(string id)
    {
        var department = await _departmentService.GetDepartmentByIdAsync(id);
        return Ok(ApiResponse<DepartmentDto>.SuccessResponse(department, "Department retrieved successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<DepartmentDto>.ErrorResponse("Invalid input"));

        var department = await _departmentService.CreateDepartmentAsync(request);
        return Created("", ApiResponse<DepartmentDto>.SuccessResponse(department, "Department created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateDepartment(string id, [FromBody] UpdateDepartmentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<DepartmentDto>.ErrorResponse("Invalid input"));

        var department = await _departmentService.UpdateDepartmentAsync(id, request);
        return Ok(ApiResponse<DepartmentDto>.SuccessResponse(department, "Department updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDepartment(string id)
    {
        var result = await _departmentService.DeleteDepartmentAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Department deleted successfully"));
    }

    [HttpGet("{id}/employees")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetDepartmentEmployees(string id)
    {
        var employees = await _userService.GetUsersByDepartmentAsync(id);
        return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(employees, "Department employees retrieved successfully"));
    }
}
