using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IVisitorLogRepository : IRepository<VisitorLog>
{
    Task<IEnumerable<VisitorLog>> GetActiveVisitorLogsAsync();
}
