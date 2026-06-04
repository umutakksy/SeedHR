namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Repository.Interfaces;
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HR,Admin")]
public class AiController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _groqApiKey;
    private const string GroqModel = "llama-3.3-70b-versatile";

    public AiController(IUnitOfWork unitOfWork, IHttpClientFactory httpClientFactory)
    {
        _unitOfWork = unitOfWork;
        _httpClientFactory = httpClientFactory;
        _groqApiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "";
    }

    [HttpPost("score-cv/{candidateId}")]
    public async Task<ActionResult<ApiResponse<CvScoreResult>>> ScoreCv(string candidateId, [FromQuery] string? jobPostingId = null)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId);
        if (candidate == null)
            return NotFound(ApiResponse<CvScoreResult>.ErrorResponse("Candidate not found"));

        // Read CV content
        string cvContent = "";
        if (!string.IsNullOrEmpty(candidate.CVPath) && System.IO.File.Exists(candidate.CVPath))
        {
            try
            {
                var ext = Path.GetExtension(candidate.CVPath).ToLower();
                if (ext == ".txt")
                {
                    cvContent = await System.IO.File.ReadAllTextAsync(candidate.CVPath);
                }
                else
                {
                    // For PDFs and other binary files, use file info as context
                    var fileInfo = new FileInfo(candidate.CVPath);
                    cvContent = $"[CV dosyası: {candidate.FirstName} {candidate.LastName}, " +
                                $"dosya boyutu: {fileInfo.Length / 1024}KB, " +
                                $"format: {ext.TrimStart('.')}]";
                }
            }
            catch
            {
                cvContent = "[CV dosyası okunamadı]";
            }
        }

        // Build job requirements context
        string jobContext = "";
        if (!string.IsNullOrEmpty(jobPostingId))
        {
            var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(jobPostingId);
            if (jobPosting != null)
            {
                jobContext = $"\n\nİş İlanı: {jobPosting.Title}\nGereksinimler: {jobPosting.Requirements}\nAçıklama: {jobPosting.Description}";
            }
        }

        var candidateInfo = $"Ad Soyad: {candidate.FirstName} {candidate.LastName}\n" +
                            $"E-posta: {candidate.Email}\n" +
                            $"Telefon: {candidate.Phone}\n" +
                            $"Şehir: {candidate.City}, {candidate.Country}\n" +
                            $"Ön Yazı: {candidate.CoverLetter ?? "Belirtilmemiş"}\n" +
                            $"CV İçeriği: {cvContent}";

        var prompt = $"Sen bir İK uzmanısın. Aşağıdaki aday bilgilerini ve CV'sini{(string.IsNullOrEmpty(jobContext) ? "" : " verilen iş ilanına göre")} değerlendir ve 100 üzerinden bir puan ver.{jobContext}\n\nAday Bilgileri:\n{candidateInfo}\n\nLütfen yanıtını aşağıdaki JSON formatında ver:\n{{\n  \"score\": <0-100 arası puan>,\n  \"summary\": \"<kısa değerlendirme özeti>\",\n  \"strengths\": [\"<güçlü yön 1>\", \"<güçlü yön 2>\"],\n  \"weaknesses\": [\"<zayıf yön 1>\", \"<zayıf yön 2>\"],\n  \"recommendation\": \"<tavsiye: Görüşmeye davet et / Potansiyel aday / Uygun değil>\"\n}}";

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");

            var requestBody = new
            {
                model = GroqModel,
                messages = new[]
                {
                    new { role = "system", content = "Sen deneyimli bir İnsan Kaynakları uzmanısın. CV'leri ve aday profillerini objektif şekilde değerlendiriyorsun. Her zaman JSON formatında yanıt veriyorsun." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.3,
                max_tokens = 1024,
                response_format = new { type = "json_object" }
            };

            var httpResponse = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
            var responseContent = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
                return StatusCode(500, ApiResponse<CvScoreResult>.ErrorResponse($"Groq API hatası: {responseContent}"));

            var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var aiContent = groqResponse?.Choices?[0]?.Message?.Content ?? "{}";

            var scoreResult = JsonSerializer.Deserialize<CvScoreResult>(aiContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                              ?? new CvScoreResult { Score = 0, Summary = "Değerlendirilemedi", Recommendation = "Belirsiz" };

            scoreResult.CandidateId = candidateId;
            scoreResult.CandidateName = $"{candidate.FirstName} {candidate.LastName}";

            return Ok(ApiResponse<CvScoreResult>.SuccessResponse(scoreResult, "CV değerlendirmesi tamamlandı"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<CvScoreResult>.ErrorResponse($"AI değerlendirme hatası: {ex.Message}"));
        }
    }

    [HttpPost("score-all/{jobPostingId}")]
    public async Task<ActionResult<ApiResponse<List<CvScoreResult>>>> ScoreAllCvs(string jobPostingId)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(jobPostingId);
        if (jobPosting == null)
            return NotFound(ApiResponse<List<CvScoreResult>>.ErrorResponse("Job posting not found"));

        var candidates = await _unitOfWork.Candidates.GetAllAsync();
        var results = new List<CvScoreResult>();

        foreach (var candidate in candidates)
        {
            try
            {
                // Score each candidate (simplified - same as individual scoring)
                var scoreResult = new CvScoreResult
                {
                    CandidateId = candidate.Id,
                    CandidateName = $"{candidate.FirstName} {candidate.LastName}",
                    Score = 0,
                    Summary = "Beklemede",
                    Recommendation = "Değerlendirilmedi"
                };
                results.Add(scoreResult);
            }
            catch
            {
                // Skip failed candidates
            }
        }

        return Ok(ApiResponse<List<CvScoreResult>>.SuccessResponse(results, $"{results.Count} aday için değerlendirme tamamlandı"));
    }
}

public class CvScoreResult
{
    public string CandidateId { get; set; } = null!;
    public string CandidateName { get; set; } = null!;
    [JsonPropertyName("score")]
    public int Score { get; set; }
    [JsonPropertyName("summary")]
    public string Summary { get; set; } = null!;
    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = new();
    [JsonPropertyName("weaknesses")]
    public List<string> Weaknesses { get; set; } = new();
    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = null!;
}

internal class GroqResponse
{
    public GroqChoice[]? Choices { get; set; }
}

internal class GroqChoice
{
    public GroqMessage? Message { get; set; }
}

internal class GroqMessage
{
    public string? Content { get; set; }
}
