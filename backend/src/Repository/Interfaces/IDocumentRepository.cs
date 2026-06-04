namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IDocumentRepository : IRepository<Document>
{
    Task<IEnumerable<Document>> GetByUserAsync(string userId);
}
