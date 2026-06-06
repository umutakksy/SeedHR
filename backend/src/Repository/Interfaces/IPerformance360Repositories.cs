using SeedHR.Backend.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SeedHR.Backend.Repository.Interfaces;

public interface ICompetencyFormRepository : IRepository<CompetencyForm>
{
    Task<IEnumerable<CompetencyForm>> GetByDepartmentAsync(string departmentId);
}

public interface IEvaluation360Repository : IRepository<Evaluation360>
{
    Task<IEnumerable<Evaluation360>> GetEvaluationsForEmployeeAsync(string employeeId, string period);
    Task<IEnumerable<Evaluation360>> GetEvaluationsByEvaluatorAsync(string evaluatorId);
    Task<Evaluation360?> GetSpecificEvaluationAsync(string employeeId, string evaluatorId, string period);
}
