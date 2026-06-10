namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class PositionService : IPositionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;

    public PositionService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<PositionDto> GetPositionByIdAsync(string id)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(id)
            ?? throw new NotFoundException($"Position with ID {id} not found");
        return _mapper.Map<PositionDto>(position);
    }

    public async Task<IEnumerable<PositionDto>> GetAllPositionsAsync()
    {
        return await _cache.GetOrCreateAsync("positions_all", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            var positions = await _unitOfWork.Positions.GetAllAsync();
            return _mapper.Map<IEnumerable<PositionDto>>(positions);
        }) ?? Array.Empty<PositionDto>();
    }

    public async Task<IEnumerable<PositionDto>> GetPositionsByDepartmentAsync(string departmentId)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(departmentId)
            ?? throw new NotFoundException($"Department with ID {departmentId} not found");

        var positions = await _unitOfWork.Positions.GetByDepartmentAsync(departmentId);
        return _mapper.Map<IEnumerable<PositionDto>>(positions);
    }

    public async Task<PositionDto> CreatePositionAsync(CreatePositionRequest request)
    {
        var existingPos = await _unitOfWork.Positions.GetByCodeAsync(request.Code);
        if (existingPos != null)
            throw new ConflictException($"Position with code {request.Code} already exists");

        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId)
            ?? throw new NotFoundException($"Department with ID {request.DepartmentId} not found");

        var position = new Position
        {
            Title = request.Title,
            Code = request.Code,
            Description = request.Description,
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        var created = await _unitOfWork.Positions.AddAsync(position);
        await _unitOfWork.SaveChangesAsync();
        _cache.Remove("positions_all");

        return _mapper.Map<PositionDto>(created);
    }

    public async Task<PositionDto> UpdatePositionAsync(string id, UpdatePositionRequest request)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(id)
            ?? throw new NotFoundException($"Position with ID {id} not found");

        if (request.Code != position.Code)
        {
            var existingPos = await _unitOfWork.Positions.GetByCodeAsync(request.Code);
            if (existingPos != null)
                throw new ConflictException($"Position with code {request.Code} already exists");
        }

        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId)
            ?? throw new NotFoundException($"Department with ID {request.DepartmentId} not found");

        position.Title = request.Title;
        position.Code = request.Code;
        position.Description = request.Description;
        position.DepartmentId = request.DepartmentId;
        position.IsActive = request.IsActive;

        var updated = await _unitOfWork.Positions.UpdateAsync(position);
        await _unitOfWork.SaveChangesAsync();
        _cache.Remove("positions_all");

        return _mapper.Map<PositionDto>(updated);
    }

    public async Task<bool> DeletePositionAsync(string id)
    {
        var result = await _unitOfWork.Positions.DeleteAsync(id);
        if (result)
        {
            _cache.Remove("positions_all");
        }
        return result;
    }
}
