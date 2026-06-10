namespace SeedHR.Backend.Repository.Interfaces;

using SeedHR.Backend.Models.Entities;
using System.Linq.Expressions;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    Task<T> AddAsync(T entity);
    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(string id);
    Task<bool> DeleteAsync(T entity);
    Task<bool> DeleteRangeAsync(Expression<Func<T, bool>> predicate);
    Task<bool> SaveChangesAsync();
    Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
        Expression<Func<T, bool>>? filter,
        int page,
        int pageSize,
        Expression<Func<T, object>>? sortBy = null,
        bool descending = false
    );
    IQueryable<T> GetQueryable();
}
