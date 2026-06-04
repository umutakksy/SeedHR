namespace SeedHR.Backend.Repository.Implementations;

using MongoDB.Bson;
using MongoDB.Driver;
using SeedHR.Backend.Data;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using System.Linq.Expressions;

public class MongoRepository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly IMongoCollection<T> _collection;

    public MongoRepository(IMongoDbContext context)
    {
        var collectionName = typeof(T).Name.ToLowerInvariant() + "s";
        if (typeof(T).Name == "Role" || typeof(T).Name == "Permission")
            collectionName = typeof(T).Name.ToLowerInvariant() + "s";

        _collection = context.GetType().GetProperty(typeof(T).Name + "s")?.GetValue(context) as IMongoCollection<T>
            ?? throw new InvalidOperationException($"Collection not found for type {typeof(T).Name}");
    }

    public async Task<T?> GetByIdAsync(string id)
    {
        var filter = Builders<T>.Filter.And(
            Builders<T>.Filter.Eq(e => e.Id, id),
            Builders<T>.Filter.Eq(e => e.IsActive, true)
        );
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        var filter = Builders<T>.Filter.Eq(e => e.IsActive, true);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        var filter = Builders<T>.Filter.And(
            Builders<T>.Filter.Where(predicate),
            Builders<T>.Filter.Eq(e => e.IsActive, true)
        );
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        var filter = Builders<T>.Filter.And(
            Builders<T>.Filter.Where(predicate),
            Builders<T>.Filter.Eq(e => e.IsActive, true)
        );
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
    {
        var filter = Builders<T>.Filter.And(
            Builders<T>.Filter.Where(predicate),
            Builders<T>.Filter.Eq(e => e.IsActive, true)
        );
        return await _collection.Find(filter).AnyAsync();
    }

    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        var filter = Builders<T>.Filter.Eq(e => e.IsActive, true);
        if (predicate != null)
            filter = Builders<T>.Filter.And(
                filter,
                Builders<T>.Filter.Where(predicate)
            );
        return (int)await _collection.CountDocumentsAsync(filter);
    }

    public async Task<T> AddAsync(T entity)
    {
        entity.Id = ObjectId.GenerateNewId().ToString();
        entity.CreatedAt = DateTime.UtcNow;
        entity.IsActive = true;
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities)
    {
        var entityList = entities.ToList();
        foreach (var entity in entityList)
        {
            entity.Id = ObjectId.GenerateNewId().ToString();
            entity.CreatedAt = DateTime.UtcNow;
            entity.IsActive = true;
        }
        await _collection.InsertManyAsync(entityList);
        return entityList;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        var filter = Builders<T>.Filter.Eq(e => e.Id, entity.Id);
        await _collection.ReplaceOneAsync(filter, entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq(e => e.Id, id);
        var update = Builders<T>.Update
            .Set(e => e.IsActive, false)
            .Set(e => e.UpdatedAt, DateTime.UtcNow);
        var result = await _collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(T entity)
    {
        return await DeleteAsync(entity.Id);
    }

    public async Task<bool> DeleteRangeAsync(Expression<Func<T, bool>> predicate)
    {
        var filter = Builders<T>.Filter.Where(predicate);
        var update = Builders<T>.Update
            .Set(e => e.IsActive, false)
            .Set(e => e.UpdatedAt, DateTime.UtcNow);
        var result = await _collection.UpdateManyAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public Task<bool> SaveChangesAsync()
    {
        return Task.FromResult(true);
    }

    public IQueryable<T> GetQueryable()
    {
        return _collection.AsQueryable().Where(e => e.IsActive);
    }
}
