namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;

public class PositionService : IPositionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PositionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PositionDto> GetPositionByIdAsync(string id)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(id)
            ?? throw new NotFoundException($"Position with ID {id} not found");
        return _mapper.Map<PositionDto>(position);
    }

    public async Task<IEnumerable<PositionDto>> GetAllPositionsAsync()
    {
        var positions = await _unitOfWork.Positions.GetAllAsync();
        return _mapper.Map<IEnumerable<PositionDto>>(positions);
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

        var updated = await _unitOfWork.Positions.UpdateAsync(position);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<PositionDto>(updated);
    }

    public async Task<bool> DeletePositionAsync(string id)
    {
        return await _unitOfWork.Positions.DeleteAsync(id);
    }
}
