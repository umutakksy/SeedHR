using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Implementations;

public class AssetService : IAssetService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AssetService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AssetDto> CreateAssetAsync(CreateAssetRequest request)
    {
        var asset = _mapper.Map<Asset>(request);
        asset.Status = "Available";
        asset.IsActive = true;
        asset.CreatedAt = DateTime.UtcNow;

        var created = await _unitOfWork.Assets.AddAsync(asset);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AssetDto>(created);
    }

    public async Task<AssetDto> GetAssetByIdAsync(string id)
    {
        var asset = await _unitOfWork.Assets.GetByIdAsync(id)
            ?? throw new NotFoundException($"Asset with ID {id} not found");

        var dto = _mapper.Map<AssetDto>(asset);
        if (!string.IsNullOrEmpty(asset.CurrentAssigneeId))
        {
            var user = await _unitOfWork.Users.GetByIdAsync(asset.CurrentAssigneeId);
            if (user != null)
            {
                dto.CurrentAssigneeName = user.FullName;
            }
        }
        return dto;
    }

    public async Task<IEnumerable<AssetDto>> GetAllAssetsAsync(string? type = null, string? status = null)
    {
        var assets = await _unitOfWork.Assets.GetAllAsync();
        var activeAssets = assets.Where(a => a.IsActive);

        if (!string.IsNullOrEmpty(type))
        {
            activeAssets = activeAssets.Where(a => a.Type.Equals(type, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(status))
        {
            activeAssets = activeAssets.Where(a => a.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        var list = activeAssets.ToList();
        var dtos = _mapper.Map<IEnumerable<AssetDto>>(list).ToList();

        // Populate Assignee Names in bulk
        var users = (await _unitOfWork.Users.GetAllAsync()).ToDictionary(u => u.Id);
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CurrentAssigneeId) && users.TryGetValue(dto.CurrentAssigneeId, out var user))
            {
                dto.CurrentAssigneeName = user.FullName;
            }
        }

        return dtos;
    }

    public async Task<AssetDto> UpdateAssetAsync(string id, CreateAssetRequest request)
    {
        var asset = await _unitOfWork.Assets.GetByIdAsync(id)
            ?? throw new NotFoundException($"Asset with ID {id} not found");

        _mapper.Map(request, asset);
        asset.UpdatedAt = DateTime.UtcNow;

        var updated = await _unitOfWork.Assets.UpdateAsync(asset);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<AssetDto>(updated);
        if (!string.IsNullOrEmpty(updated.CurrentAssigneeId))
        {
            var user = await _unitOfWork.Users.GetByIdAsync(updated.CurrentAssigneeId);
            if (user != null)
            {
                dto.CurrentAssigneeName = user.FullName;
            }
        }
        return dto;
    }

    public async Task<bool> DeleteAssetAsync(string id)
    {
        var asset = await _unitOfWork.Assets.GetByIdAsync(id)
            ?? throw new NotFoundException($"Asset with ID {id} not found");

        if (asset.Status == "Assigned")
        {
            throw new ConflictException("Cannot delete an asset that is currently assigned to a user.");
        }

        asset.IsActive = false;
        asset.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Assets.UpdateAsync(asset);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<AssetDto> AllocateAssetAsync(string assetId, AllocateAssetRequest request)
    {
        var asset = await _unitOfWork.Assets.GetByIdAsync(assetId)
            ?? throw new NotFoundException($"Asset with ID {assetId} not found");

        if (asset.Status != "Available")
        {
            throw new ConflictException($"Asset is not available for allocation. Current status: {asset.Status}");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId)
            ?? throw new NotFoundException($"User with ID {request.UserId} not found");

        // Update Asset
        asset.Status = "Assigned";
        asset.CurrentAssigneeId = request.UserId;
        asset.AssignmentDate = DateTime.UtcNow;
        asset.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Assets.UpdateAsync(asset);

        // Create Allocation Record
        var allocation = new AssetAllocation
        {
            AssetId = assetId,
            UserId = request.UserId,
            DepartmentId = user.DepartmentId,
            AllocationDate = DateTime.UtcNow,
            ConditionOnAllocation = asset.Condition,
            SignatureUrl = request.SignatureData,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.AssetAllocations.AddAsync(allocation);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<AssetDto>(asset);
        dto.CurrentAssigneeName = user.FullName;
        return dto;
    }

    public async Task<AssetDto> ReturnAssetAsync(string assetId, string? condition = null)
    {
        var asset = await _unitOfWork.Assets.GetByIdAsync(assetId)
            ?? throw new NotFoundException($"Asset with ID {assetId} not found");

        if (asset.Status != "Assigned" || string.IsNullOrEmpty(asset.CurrentAssigneeId))
        {
            throw new ConflictException("Asset is not currently assigned to any user.");
        }

        // Find active allocation
        var activeAllocation = await _unitOfWork.AssetAllocations.GetActiveAllocationAsync(assetId);
        if (activeAllocation != null)
        {
            activeAllocation.ReturnDate = DateTime.UtcNow;
            activeAllocation.ConditionOnReturn = condition ?? asset.Condition;
            activeAllocation.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.AssetAllocations.UpdateAsync(activeAllocation);
        }

        // Update Asset
        asset.Status = "Returned";
        if (!string.IsNullOrEmpty(condition))
        {
            asset.Condition = condition;
        }
        asset.CurrentAssigneeId = null;
        asset.AssignmentDate = null;
        asset.UpdatedAt = DateTime.UtcNow;

        // Change returned assets status back to Available automatically
        asset.Status = "Available";

        await _unitOfWork.Assets.UpdateAsync(asset);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AssetDto>(asset);
    }

    public async Task<IEnumerable<AssetDto>> GetAssetsByUserAsync(string userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found");

        var assets = await _unitOfWork.Assets.GetAssetsByUserAsync(userId);
        var dtos = _mapper.Map<IEnumerable<AssetDto>>(assets).ToList();
        foreach (var dto in dtos)
        {
            dto.CurrentAssigneeName = user.FullName;
        }
        return dtos;
    }

    public async Task<IEnumerable<AssetReportDto>> GetAssetReportByDepartmentAsync()
    {
        var departments = await _unitOfWork.Departments.GetAllAsync();
        var allAssets = await _unitOfWork.Assets.GetAllAsync();
        var activeAssets = allAssets.Where(a => a.IsActive && a.Status == "Assigned" && !string.IsNullOrEmpty(a.CurrentAssigneeId)).ToList();
        var users = (await _unitOfWork.Users.GetAllAsync()).ToDictionary(u => u.Id);

        var report = new List<AssetReportDto>();

        foreach (var dept in departments.Where(d => d.IsActive))
        {
            var deptAssets = activeAssets.Where(a => {
                if (users.TryGetValue(a.CurrentAssigneeId!, out var user))
                {
                    return user.DepartmentId == dept.Id;
                }
                return false;
            }).ToList();

            if (deptAssets.Count > 0)
            {
                var deptDtos = _mapper.Map<List<AssetDto>>(deptAssets);
                foreach (var dto in deptDtos)
                {
                    if (users.TryGetValue(dto.CurrentAssigneeId!, out var u))
                        dto.CurrentAssigneeName = u.FullName;
                }

                report.Add(new AssetReportDto
                {
                    DepartmentId = dept.Id,
                    DepartmentName = dept.Name,
                    TotalAssetsAllocated = deptAssets.Count,
                    TotalValue = deptAssets.Sum(a => a.PurchasePrice),
                    AllocatedAssets = deptDtos
                });
            }
        }

        return report;
    }

    public async Task<AssetInventoryDto> GetAssetInventorySummaryAsync()
    {
        var assets = (await _unitOfWork.Assets.GetAllAsync()).Where(a => a.IsActive).ToList();

        var summary = new AssetInventoryDto
        {
            TotalAssets = assets.Count,
            AvailableAssets = assets.Count(a => a.Status == "Available"),
            AssignedAssets = assets.Count(a => a.Status == "Assigned"),
            BrokenAssets = assets.Count(a => a.Status == "Broken"),
            ReturnedAssets = assets.Count(a => a.Status == "Returned"),
            TotalInventoryValue = assets.Sum(a => a.PurchasePrice)
        };

        summary.CountByType = assets
            .GroupBy(a => a.Type)
            .ToDictionary(g => g.Key, g => g.Count());

        return summary;
    }
}
