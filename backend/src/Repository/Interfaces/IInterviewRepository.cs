namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IInterviewRepository : IRepository<Interview>
{
    Task<IEnumerable<Interview>> GetByCandidateAsync(string candidateId);
    Task<IEnumerable<Interview>> GetByInterviewerAsync(string interviewerId);
    Task<IEnumerable<Interview>> GetUpcomingInterviewsAsync(int days = 30);
}
