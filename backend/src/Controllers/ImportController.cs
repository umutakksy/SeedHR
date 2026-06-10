namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniExcelLibs;
using MongoDB.Bson;
using MongoDB.Driver;
using SeedHR.Backend.Data;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Security.Authentication;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,HR")]
public class ImportController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ImportController(IMongoDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    private static string GenerateRandomPassword()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 10).Select(s => s[random.Next(s.Length)]).ToArray());
    }

    /// <summary>
    /// Excel dosyasından toplu veri import eder.
    /// Sheet isimleri: Users, Departments, Positions
    /// </summary>
    [HttpPost("excel")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB limit
    public async Task<ActionResult<ApiResponse<ImportResultDto>>> ImportExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<ImportResultDto>.ErrorResponse("Dosya seçilmedi."));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx" && ext != ".xls")
            return BadRequest(ApiResponse<ImportResultDto>.ErrorResponse("Sadece .xlsx ve .xls dosyaları desteklenir."));

        var result = new ImportResultDto();
        var errors = new List<string>();

        try
        {
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            var sheetNames = MiniExcel.GetSheetNames(stream);

            // --- DEPARTMENTS ---
            if (sheetNames.Any(s => s.Equals("Departments", StringComparison.OrdinalIgnoreCase) || s.Equals("Departmanlar", StringComparison.OrdinalIgnoreCase)))
            {
                stream.Position = 0;
                var sheetName = sheetNames.First(s => s.Equals("Departments", StringComparison.OrdinalIgnoreCase) || s.Equals("Departmanlar", StringComparison.OrdinalIgnoreCase));
                var rows = MiniExcel.Query(stream, sheetName: sheetName, useHeaderRow: true).ToList();

                var departmentsToInsert = new List<Department>();
                foreach (var row in rows)
                {
                    try
                    {
                        var dict = (IDictionary<string, object>)row;
                        var name = GetValue(dict, "Name", "Ad", "DepartmanAdi");
                        var code = GetValue(dict, "Code", "Kod", "DepartmanKodu");

                        if (string.IsNullOrWhiteSpace(name))
                        {
                            errors.Add($"Departments: Satır atlandı — 'Name/Ad' boş.");
                            continue;
                        }

                        var dept = new Department
                        {
                            Id = ObjectId.GenerateNewId().ToString(),
                            Name = name,
                            Code = code ?? name[..Math.Min(3, name.Length)].ToUpperInvariant(),
                            Description = GetValue(dict, "Description", "Aciklama") ?? "",
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        departmentsToInsert.Add(dept);
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Departments satır hatası: {ex.Message}");
                    }
                }

                if (departmentsToInsert.Any())
                {
                    await _context.Departments.InsertManyAsync(departmentsToInsert);
                    result.DepartmentsImported = departmentsToInsert.Count;
                }
            }

            // --- POSITIONS ---
            if (sheetNames.Any(s => s.Equals("Positions", StringComparison.OrdinalIgnoreCase) || s.Equals("Pozisyonlar", StringComparison.OrdinalIgnoreCase)))
            {
                stream.Position = 0;
                var sheetName = sheetNames.First(s => s.Equals("Positions", StringComparison.OrdinalIgnoreCase) || s.Equals("Pozisyonlar", StringComparison.OrdinalIgnoreCase));
                var rows = MiniExcel.Query(stream, sheetName: sheetName, useHeaderRow: true).ToList();

                // Build department lookup
                var allDepts = await _context.Departments.Find(MongoDB.Driver.Builders<Department>.Filter.Empty).ToListAsync();
                var deptLookup = allDepts.ToDictionary(d => d.Name.ToLowerInvariant(), d => d.Id);

                var positionsToInsert = new List<Position>();
                foreach (var row in rows)
                {
                    try
                    {
                        var dict = (IDictionary<string, object>)row;
                        var title = GetValue(dict, "Title", "Baslik", "PozisyonAdi");
                        var code = GetValue(dict, "Code", "Kod", "PozisyonKodu");
                        var deptName = GetValue(dict, "Department", "Departman", "DepartmanAdi");

                        if (string.IsNullOrWhiteSpace(title))
                        {
                            errors.Add($"Positions: Satır atlandı — 'Title/Baslik' boş.");
                            continue;
                        }

                        string? deptId = null;
                        if (!string.IsNullOrWhiteSpace(deptName) && deptLookup.TryGetValue(deptName.ToLowerInvariant(), out var foundId))
                            deptId = foundId;

                        var pos = new Position
                        {
                            Id = ObjectId.GenerateNewId().ToString(),
                            Title = title,
                            Code = code ?? title[..Math.Min(3, title.Length)].ToUpperInvariant(),
                            Description = GetValue(dict, "Description", "Aciklama") ?? "",
                            DepartmentId = deptId ?? "",
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        positionsToInsert.Add(pos);
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Positions satır hatası: {ex.Message}");
                    }
                }

                if (positionsToInsert.Any())
                {
                    await _context.Positions.InsertManyAsync(positionsToInsert);
                    result.PositionsImported = positionsToInsert.Count;
                }
            }

            // --- USERS ---
            if (sheetNames.Any(s => s.Equals("Users", StringComparison.OrdinalIgnoreCase) || s.Equals("Calisanlar", StringComparison.OrdinalIgnoreCase) || s.Equals("Kullanicilar", StringComparison.OrdinalIgnoreCase)))
            {
                stream.Position = 0;
                var sheetName = sheetNames.First(s => s.Equals("Users", StringComparison.OrdinalIgnoreCase) || s.Equals("Calisanlar", StringComparison.OrdinalIgnoreCase) || s.Equals("Kullanicilar", StringComparison.OrdinalIgnoreCase));
                var rows = MiniExcel.Query(stream, sheetName: sheetName, useHeaderRow: true).ToList();

                // Build lookups
                var allDepts = await _context.Departments.Find(MongoDB.Driver.Builders<Department>.Filter.Empty).ToListAsync();
                var deptLookup = allDepts.ToDictionary(d => d.Name.ToLowerInvariant(), d => d.Id);

                var allPositions = await _context.Positions.Find(MongoDB.Driver.Builders<Position>.Filter.Empty).ToListAsync();
                var posLookup = allPositions.ToDictionary(p => p.Title.ToLowerInvariant(), p => p.Id);

                var allRoles = await _context.Roles.Find(MongoDB.Driver.Builders<Role>.Filter.Empty).ToListAsync();
                var roleLookup = allRoles.ToDictionary(r => r.Name.ToLowerInvariant(), r => r.Id);

                var usersToInsert = new List<User>();
                foreach (var row in rows)
                {
                    try
                    {
                        var dict = (IDictionary<string, object>)row;
                        var email = GetValue(dict, "Email", "Eposta", "EPosta");
                        var firstName = GetValue(dict, "FirstName", "Ad", "Isim");
                        var lastName = GetValue(dict, "LastName", "Soyad", "Soyisim");

                        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
                        {
                            errors.Add($"Users: Satır atlandı — Email/Ad/Soyad alanlarından biri boş.");
                            continue;
                        }

                        // Check duplicate email
                        var existingUser = await _context.Users.Find(
                            MongoDB.Driver.Builders<User>.Filter.Eq(u => u.Email, email)
                        ).FirstOrDefaultAsync();

                        if (existingUser != null)
                        {
                            errors.Add($"Users: '{email}' zaten kayıtlı, atlandı.");
                            continue;
                        }

                        if (usersToInsert.Any(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
                        {
                            errors.Add($"Users: '{email}' dosya içinde mükerrer, atlandı.");
                            continue;
                        }

                        // Resolve department
                        string? deptId = null;
                        var deptName = GetValue(dict, "Department", "Departman", "DepartmanAdi");
                        if (!string.IsNullOrWhiteSpace(deptName) && deptLookup.TryGetValue(deptName.ToLowerInvariant(), out var foundDeptId))
                            deptId = foundDeptId;

                        // Resolve position
                        string? posId = null;
                        var posTitle = GetValue(dict, "Position", "Pozisyon", "PozisyonAdi");
                        if (!string.IsNullOrWhiteSpace(posTitle) && posLookup.TryGetValue(posTitle.ToLowerInvariant(), out var foundPosId))
                            posId = foundPosId;

                        // Resolve role
                        var roleStr = GetValue(dict, "Role", "Rol") ?? "Employee";
                        var roleId = roleLookup.GetValueOrDefault(roleStr.ToLowerInvariant(), "role_employee");

                        // Parse dates
                        DateTime? dob = ParseDate(GetValue(dict, "DateOfBirth", "DogumTarihi", "Dogum"));
                        DateTime? hireDate = ParseDate(GetValue(dict, "HireDate", "IseBaslamaTarihi", "BaslamaTarihi"));

                        // Resolve password
                        var password = GetValue(dict, "Password", "Sifre", "Parola");
                        string clearPassword;
                        if (!string.IsNullOrEmpty(password))
                        {
                            clearPassword = password;
                        }
                        else
                        {
                            clearPassword = GenerateRandomPassword();
                            result.TempPasswords[email] = clearPassword;
                        }
                        var hashedPassword = _passwordHasher.Hash(clearPassword);

                        var user = new User
                        {
                            Id = ObjectId.GenerateNewId().ToString(),
                            Email = email,
                            PasswordHash = hashedPassword,
                            FirstName = firstName,
                            LastName = lastName,
                            Phone = GetValue(dict, "Phone", "Telefon", "Tel") ?? "",
                            DateOfBirth = dob ?? new DateTime(1990, 1, 1),
                            Gender = GetValue(dict, "Gender", "Cinsiyet") ?? "Other",
                            IdentityNumber = GetValue(dict, "IdentityNumber", "TCKimlik", "TC") ?? "",
                            Address = GetValue(dict, "Address", "Adres"),
                            City = GetValue(dict, "City", "Sehir", "Il"),
                            Country = GetValue(dict, "Country", "Ulke") ?? "Türkiye",
                            DepartmentId = deptId,
                            PositionId = posId,
                            HireDate = hireDate ?? DateTime.UtcNow,
                            Location = GetValue(dict, "Location", "Lokasyon", "Konum"),
                            EmergencyContactName = GetValue(dict, "EmergencyContactName", "AcilKisiAdi"),
                            EmergencyContactPhone = GetValue(dict, "EmergencyContactPhone", "AcilKisiTel"),
                            RoleId = roleId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        usersToInsert.Add(user);
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Users satır hatası: {ex.Message}");
                    }
                }

                if (usersToInsert.Any())
                {
                    await _context.Users.InsertManyAsync(usersToInsert);
                    result.UsersImported = usersToInsert.Count;
                }
            }

            result.Errors = errors;
            result.TotalImported = result.UsersImported + result.DepartmentsImported + result.PositionsImported;

            var message = $"Import tamamlandı: {result.UsersImported} kullanıcı, {result.DepartmentsImported} departman, {result.PositionsImported} pozisyon.";
            if (errors.Any())
                message += $" ({errors.Count} uyarı)";

            return Ok(ApiResponse<ImportResultDto>.SuccessResponse(result, message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ImportResultDto>.ErrorResponse($"Import sırasında hata: {ex.Message}"));
        }
    }

    /// <summary>
    /// Boş Excel şablonunu indirir (Users, Departments, Positions sheet'leri).
    /// </summary>
    [HttpGet("template")]
    [AllowAnonymous]
    public IActionResult DownloadTemplate()
    {
        var sheets = new Dictionary<string, object>
        {
            ["Departmanlar"] = new[]
            {
                new { Ad = "", Kod = "", Aciklama = "" }
            },
            ["Pozisyonlar"] = new[]
            {
                new { Baslik = "", Kod = "", Departman = "", Aciklama = "" }
            },
            ["Calisanlar"] = new[]
            {
                new
                {
                    Email = "",
                    Ad = "",
                    Soyad = "",
                    Telefon = "",
                    DogumTarihi = "",
                    Cinsiyet = "",
                    TCKimlik = "",
                    Adres = "",
                    Sehir = "",
                    Ulke = "",
                    Departman = "",
                    Pozisyon = "",
                    Rol = "Employee",
                    BaslamaTarihi = "",
                    Lokasyon = "",
                    AcilKisiAdi = "",
                    AcilKisiTel = "",
                    Sifre = ""
                }
            }
        };

        var stream = new MemoryStream();
        MiniExcel.SaveAs(stream, sheets);
        stream.Position = 0;

        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SeedHR_Import_Sablonu.xlsx");
    }

    // --- Helper methods ---

    private static string? GetValue(IDictionary<string, object> dict, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (dict.TryGetValue(key, out var val) && val != null)
            {
                var str = val.ToString()?.Trim();
                if (!string.IsNullOrEmpty(str))
                    return str;
            }
        }
        return null;
    }

    private static DateTime? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (DateTime.TryParse(value, out var date)) return date;
        if (DateTime.TryParseExact(value, new[] { "dd.MM.yyyy", "dd/MM/yyyy", "yyyy-MM-dd" },
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var parsed))
            return parsed;
        return null;
    }
}

public class ImportResultDto
{
    public int TotalImported { get; set; }
    public int UsersImported { get; set; }
    public int DepartmentsImported { get; set; }
    public int PositionsImported { get; set; }
    public List<string> Errors { get; set; } = new();
    public Dictionary<string, string> TempPasswords { get; set; } = new();
}
