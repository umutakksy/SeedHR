namespace SeedHR.Backend.Configuration;

public class MongoDbSettings
{
    public const string SectionName = "MongoDB";

    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
}
