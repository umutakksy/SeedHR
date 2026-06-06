namespace SeedHR.Backend.Models.DTOs;

public class AllocateAssetRequest
{
    public string UserId { get; set; } = null!;
    public string? SignatureData { get; set; } // Base64 imza verisi veya link
}
