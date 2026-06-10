namespace SeedHR.Backend.Services.Implementations;

using AutoMapper;
using SeedHR.Backend.Exceptions;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Security.Authentication;
using SeedHR.Backend.Services.Interfaces;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<UserDto> GetUserByIdAsync(string id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id)
            ?? throw new NotFoundException($"User with ID {id} not found");
        await PopulateNavigationPropertiesAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = (await _unitOfWork.Users.GetAllAsync()).ToList();
        await PopulateNavigationPropertiesBulkAsync(users);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<IEnumerable<UserDto>> GetUsersByDepartmentAsync(string departmentId)
    {
        var users = (await _unitOfWork.Users.GetByDepartmentAsync(departmentId)).ToList();
        await PopulateNavigationPropertiesBulkAsync(users);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<IEnumerable<UserDto>> GetUsersByPositionAsync(string positionId)
    {
        var users = (await _unitOfWork.Users.GetByPositionAsync(positionId)).ToList();
        await PopulateNavigationPropertiesBulkAsync(users);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    private async Task PopulateNavigationPropertiesBulkAsync(List<User> users)
    {
        if (users == null || users.Count == 0) return;

        var managerIds = users
            .Where(u => !string.IsNullOrEmpty(u.ManagerId))
            .Select(u => u.ManagerId!)
            .ToHashSet();

        var deptsTask     = _unitOfWork.Departments.GetAllAsync();
        var positionsTask = _unitOfWork.Positions.GetAllAsync();
        var rolesTask     = _unitOfWork.Roles.GetAllAsync();
        var managersTask  = managerIds.Count > 0
            ? _unitOfWork.Users.FindAsync(u => managerIds.Contains(u.Id))
            : Task.FromResult<IEnumerable<User>>(Array.Empty<User>());

        await Task.WhenAll(deptsTask, positionsTask, rolesTask, managersTask);

        var depts    = deptsTask.Result.ToDictionary(d => d.Id);
        var positions = positionsTask.Result.ToDictionary(p => p.Id);
        var roles    = rolesTask.Result.ToDictionary(r => r.Id);
        var managers = managersTask.Result.ToDictionary(u => u.Id);

        foreach (var user in users)
        {
            if (!string.IsNullOrEmpty(user.DepartmentId) && depts.TryGetValue(user.DepartmentId, out var dept))
                user.Department = dept;

            if (!string.IsNullOrEmpty(user.PositionId) && positions.TryGetValue(user.PositionId, out var pos))
                user.Position = pos;

            if (!string.IsNullOrEmpty(user.RoleId) && roles.TryGetValue(user.RoleId, out var role))
                user.Role = role;

            if (!string.IsNullOrEmpty(user.ManagerId) && managers.TryGetValue(user.ManagerId, out var manager))
                user.Manager = manager;
        }
    }

    private async Task PopulateNavigationPropertiesAsync(User user)
    {
        if (user == null) return;

        var deptTask    = !string.IsNullOrEmpty(user.DepartmentId) && user.Department == null
            ? _unitOfWork.Departments.GetByIdAsync(user.DepartmentId)
            : Task.FromResult<Department?>(null);
        var posTask     = !string.IsNullOrEmpty(user.PositionId) && user.Position == null
            ? _unitOfWork.Positions.GetByIdAsync(user.PositionId)
            : Task.FromResult<Position?>(null);
        var roleTask    = !string.IsNullOrEmpty(user.RoleId) && user.Role == null
            ? _unitOfWork.Roles.GetByIdAsync(user.RoleId)
            : Task.FromResult<Role?>(null);
        var managerTask = !string.IsNullOrEmpty(user.ManagerId) && user.Manager == null
            ? _unitOfWork.Users.GetByIdAsync(user.ManagerId)
            : Task.FromResult<User?>(null);

        await Task.WhenAll(deptTask, posTask, roleTask, managerTask);

        if (deptTask.Result != null)    user.Department = deptTask.Result;
        if (posTask.Result != null)     user.Position   = posTask.Result;
        if (roleTask.Result != null)    user.Role       = roleTask.Result;
        if (managerTask.Result != null) user.Manager    = managerTask.Result;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new ConflictException("Email already in use");

        var user = _mapper.Map<User>(request);
        user.PasswordHash = _passwordHasher.Hash(request.Password);

        var createdUser = await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(createdUser);
    }

    public async Task<UserDto> UpdateUserAsync(string id, UpdateUserRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id)
            ?? throw new NotFoundException($"User with ID {id} not found");

        _mapper.Map(request, user);
        var updatedUser = await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(updatedUser);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        return await _unitOfWork.Users.DeleteAsync(id);
    }

    public async Task<PaginatedResponse<UserDto>> GetPagedUsersAsync(int page, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Users.GetPagedAsync(null, page, pageSize, u => u.CreatedAt, true);
        var itemList = items.ToList();
        await PopulateNavigationPropertiesBulkAsync(itemList);
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PaginatedResponse<UserDto>
        {
            Items = _mapper.Map<List<UserDto>>(itemList),
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<IEnumerable<UserDto>> GetUpcomingBirthdaysAsync(int days = 30)
    {
        var users = await _unitOfWork.Users.GetUpcomingBirthdaysAsync(days);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }
}
