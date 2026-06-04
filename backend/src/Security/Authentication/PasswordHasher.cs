namespace SeedHR.Backend.Security.Authentication;

using BCrypt.Net;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 4)
            throw new ArgumentException("Password must be at least 4 characters");

        return BCrypt.EnhancedHashPassword(password, HashType.SHA384);
    }

    public bool Verify(string password, string hash)
    {
        try
        {
            return BCrypt.EnhancedVerify(password, hash, HashType.SHA384);
        }
        catch
        {
            return false;
        }
    }
}
