namespace SeedHR.Backend.Controllers;

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly string _uploadFolder;

    public DocumentsController(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment env)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _uploadFolder = Path.Combine(env.ContentRootPath, "uploads", "documents");
        if (!Directory.Exists(_uploadFolder))
        {
            Directory.CreateDirectory(_uploadFolder);
        }
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<DocumentDto>>> UploadDocument([FromForm] string userId, [FromForm] string documentType, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<DocumentDto>.ErrorResponse("File is empty"));

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            return NotFound(ApiResponse<DocumentDto>.ErrorResponse("User not found"));

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_uploadFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var document = new Document
        {
            FileName = file.FileName,
            FileType = file.ContentType,
            DocumentType = documentType,
            FilePath = filePath,
            FileSize = file.Length,
            UserId = userId,
            IsActive = true
        };

        var created = await _unitOfWork.Documents.AddAsync(document);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<DocumentDto>(created);
        return Created("", ApiResponse<DocumentDto>.SuccessResponse(dto, "Document uploaded successfully"));
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<DocumentDto>>>> GetUserDocuments(string userId)
    {
        var docs = await _unitOfWork.Documents.GetByUserAsync(userId);
        var dtos = _mapper.Map<IEnumerable<DocumentDto>>(docs);
        return Ok(ApiResponse<IEnumerable<DocumentDto>>.SuccessResponse(dtos, "Documents retrieved successfully"));
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(string id)
    {
        var doc = await _unitOfWork.Documents.GetByIdAsync(id);
        if (doc == null || !System.IO.File.Exists(doc.FilePath))
            return NotFound();

        var bytes = await System.IO.File.ReadAllBytesAsync(doc.FilePath);
        return File(bytes, doc.FileType, doc.FileName);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDocument(string id)
    {
        var doc = await _unitOfWork.Documents.GetByIdAsync(id);
        if (doc == null)
            return NotFound(ApiResponse<bool>.ErrorResponse("Document not found"));

        if (System.IO.File.Exists(doc.FilePath))
        {
            try
            {
                System.IO.File.Delete(doc.FilePath);
            }
            catch (Exception)
            {
                // Log warning but proceed with DB delete
            }
        }

        var result = await _unitOfWork.Documents.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(result, "Document deleted successfully"));
    }
}
