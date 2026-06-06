using SeedHR.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Services.Interfaces;

public interface IVisitorService
{
    Task<VisitorLogDto> CreateVisitorLogAsync(CreateVisitorLogRequest request);
    Task<VisitorLogDto> GetVisitorByIdAsync(string id);
    Task<IEnumerable<VisitorLogDto>> GetActiveVisitorLogsAsync();
    Task<IEnumerable<VisitorLogDto>> GetAllVisitorLogsAsync();
    Task<VisitorLogDto> CheckInVisitorAsync(string id);
    Task<VisitorLogDto> CheckOutVisitorAsync(string id);
}
