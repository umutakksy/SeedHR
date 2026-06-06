using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface IReferenceCheckRepository : IRepository<ReferenceCheck>
{
    Task<IEnumerable<ReferenceCheck>> GetReferencesByCandidateAsync(string candidateId);
    Task<ReferenceCheck?> GetByEmailAndCandidateAsync(string email, string candidateId);
}
