namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DepartmentService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DepartmentDto> GetDepartmentByIdAsync(string id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id)
            ?? throw new NotFoundException($"Department with ID {id} not found");
        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
    {
        var departments = await _unitOfWork.Departments.GetAllAsync();
        return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        var existingDept = await _unitOfWork.Departments.GetByCodeAsync(request.Code);
        if (existingDept != null)
            throw new ConflictException($"Department with code {request.Code} already exists");

        var department = new Department
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            IsActive = true
        };

        var created = await _unitOfWork.Departments.AddAsync(department);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<DepartmentDto>(created);
    }

    public async Task<DepartmentDto> UpdateDepartmentAsync(string id, UpdateDepartmentRequest request)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id)
            ?? throw new NotFoundException($"Department with ID {id} not found");

        if (request.Code != department.Code)
        {
            var existingDept = await _unitOfWork.Departments.GetByCodeAsync(request.Code);
            if (existingDept != null)
                throw new ConflictException($"Department with code {request.Code} already exists");
        }

        department.Name = request.Name;
        department.Code = request.Code;
        department.Description = request.Description;
        department.IsActive = request.IsActive;

        var updated = await _unitOfWork.Departments.UpdateAsync(department);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<DepartmentDto>(updated);
    }

    public async Task<bool> DeleteDepartmentAsync(string id)
    {
        return await _unitOfWork.Departments.DeleteAsync(id);
    }
}
