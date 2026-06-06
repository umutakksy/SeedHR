using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Services.Interfaces;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SeedHR.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetsController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AssetDto>>>> GetAllAssets([FromQuery] string? type = null, [FromQuery] string? status = null)
    {
        var assets = await _assetService.GetAllAssetsAsync(type, status);
        return Ok(ApiResponse<IEnumerable<AssetDto>>.SuccessResponse(assets, "Assets retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AssetDto>>> GetAssetById(string id)
    {
        var asset = await _assetService.GetAssetByIdAsync(id);
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && role != "Manager" && asset.CurrentAssigneeId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ApiResponse<AssetDto>.SuccessResponse(asset, "Asset retrieved successfully"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<AssetDto>>> CreateAsset([FromBody] CreateAssetRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AssetDto>.ErrorResponse("Invalid input"));

        var asset = await _assetService.CreateAssetAsync(request);
        return Created("", ApiResponse<AssetDto>.SuccessResponse(asset, "Asset created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<AssetDto>>> UpdateAsset(string id, [FromBody] CreateAssetRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AssetDto>.ErrorResponse("Invalid input"));

        var asset = await _assetService.UpdateAssetAsync(id, request);
        return Ok(ApiResponse<AssetDto>.SuccessResponse(asset, "Asset updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAsset(string id)
    {
        var result = await _assetService.DeleteAssetAsync(id);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "Asset deleted successfully"));
    }

    [HttpPost("{id}/allocate")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<AssetDto>>> AllocateAsset(string id, [FromBody] AllocateAssetRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<AssetDto>.ErrorResponse("Invalid input"));

        var asset = await _assetService.AllocateAssetAsync(id, request);
        return Ok(ApiResponse<AssetDto>.SuccessResponse(asset, "Asset allocated successfully"));
    }

    [HttpPost("{id}/return")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<ActionResult<ApiResponse<AssetDto>>> ReturnAsset(string id, [FromQuery] string? condition = null)
    {
        var asset = await _assetService.ReturnAssetAsync(id, condition);
        return Ok(ApiResponse<AssetDto>.SuccessResponse(asset, "Asset returned successfully"));
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AssetDto>>>> GetAssetsByUser(string userId)
    {
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        if (role != "Admin" && role != "HR" && role != "Manager" && currentUserId != userId)
        {
            return Forbid();
        }

        var assets = await _assetService.GetAssetsByUserAsync(userId);
        return Ok(ApiResponse<IEnumerable<AssetDto>>.SuccessResponse(assets, "User's assets retrieved successfully"));
    }

    [HttpGet("report")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AssetReportDto>>>> GetAssetReport()
    {
        var report = await _assetService.GetAssetReportByDepartmentAsync();
        return Ok(ApiResponse<IEnumerable<AssetReportDto>>.SuccessResponse(report, "Department asset report retrieved successfully"));
    }

    [HttpGet("summary")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<ActionResult<ApiResponse<AssetInventoryDto>>> GetAssetInventorySummary()
    {
        var summary = await _assetService.GetAssetInventorySummaryAsync();
        return Ok(ApiResponse<AssetInventoryDto>.SuccessResponse(summary, "Asset inventory summary retrieved successfully"));
    }
}
