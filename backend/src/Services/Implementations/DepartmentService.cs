namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;

    public DepartmentService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<DepartmentDto> GetDepartmentByIdAsync(string id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id)
            ?? throw new NotFoundException($"Department with ID {id} not found");
        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
    {
        return await _cache.GetOrCreateAsync("departments_all", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            var departments = await _unitOfWork.Departments.GetAllAsync();
            return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
        }) ?? Array.Empty<DepartmentDto>();
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
        _cache.Remove("departments_all");

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
        _cache.Remove("departments_all");

        return _mapper.Map<DepartmentDto>(updated);
    }

    public async Task<bool> DeleteDepartmentAsync(string id)
    {
        var result = await _unitOfWork.Departments.DeleteAsync(id);
        if (result)
        {
            _cache.Remove("departments_all");
        }
        return result;
    }
}
