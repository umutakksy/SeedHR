using AutoMapper;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Models.Entities;

namespace SeedHR.Backend.Utils.Mappers;

public class AssetMappingProfile : Profile
{
    public AssetMappingProfile()
    {
        CreateMap<Asset, AssetDto>();
        CreateMap<CreateAssetRequest, Asset>();
    }
}
