namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class LogsController : ControllerBase
{
    private readonly string _logsDirectory;

    public LogsController()
    {
        // Path relative to the executable / project root or logs folder
        _logsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "logs");
    }

    [HttpGet]
    public ActionResult<ApiResponse<List<LogFileDto>>> GetLogFiles()
    {
        if (!Directory.Exists(_logsDirectory))
        {
            return Ok(ApiResponse<List<LogFileDto>>.SuccessResponse(new List<LogFileDto>(), "Logs directory not found"));
        }

        var files = Directory.GetFiles(_logsDirectory, "seedhr-*.txt")
            .Select(f => {
                var info = new FileInfo(f);
                return new LogFileDto
                {
                    FileName = Path.GetFileName(f),
                    SizeInBytes = info.Length,
                    LastModified = info.LastWriteTime
                };
            })
            .OrderByDescending(f => f.LastModified)
            .ToList();

        return Ok(ApiResponse<List<LogFileDto>>.SuccessResponse(files, "Log files retrieved successfully"));
    }

    [HttpGet("view/{fileName}")]
    public async Task<ActionResult<ApiResponse<string>>> ViewLog(string fileName, [FromQuery] int lines = 200)
    {
        var filePath = Path.Combine(_logsDirectory, fileName);
        if (!System.IO.File.Exists(filePath) || !Path.GetFileName(filePath).StartsWith("seedhr-"))
        {
            return NotFound(ApiResponse<string>.ErrorResponse("Log file not found"));
        }

        try
        {
            // Read last N lines safely to avoid reading huge memory
            var allLines = await System.IO.File.ReadAllLinesAsync(filePath);
            var lastLines = allLines.Skip(Math.Max(0, allLines.Length - lines)).ToList();
            var content = string.Join(Environment.NewLine, lastLines);

            return Ok(ApiResponse<string>.SuccessResponse(content, $"Last {lastLines.Count} lines retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.ErrorResponse($"Error reading log file: {ex.Message}"));
        }
    }

    [HttpDelete("{fileName}")]
    public ActionResult<ApiResponse<bool>> DeleteLogFile(string fileName)
    {
        var filePath = Path.Combine(_logsDirectory, fileName);
        if (!System.IO.File.Exists(filePath) || !Path.GetFileName(filePath).StartsWith("seedhr-"))
        {
            return NotFound(ApiResponse<bool>.ErrorResponse("Log file not found"));
        }

        try
        {
            System.IO.File.Delete(filePath);
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Log file deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<bool>.ErrorResponse($"Error deleting log file: {ex.Message}"));
        }
    }
}

public class LogFileDto
{
    public string FileName { get; set; } = null!;
    public long SizeInBytes { get; set; }
    public DateTime LastModified { get; set; }
    public string SizeFormatted
    {
        get
        {
            if (SizeInBytes >= 1024 * 1024)
                return $"{SizeInBytes / (1024.0 * 1024.0):F2} MB";
            return $"{SizeInBytes / 1024.0:F2} KB";
        }
    }
}
