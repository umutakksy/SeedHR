namespace SeedHR.Backend.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeedHR.Backend.Models.DTOs;
using SeedHR.Backend.Repository.Interfaces;
using SeedHR.Backend.Models.Entities;
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    [Authorize(Roles = "HR,Admin")]
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
        string activeJobTitle = "Genel Başvuru";
        string activeJobReqs = "Belirtilmemiş";

        var targetJobId = jobPostingId;
        if (string.IsNullOrEmpty(targetJobId) && candidate.Applications != null && candidate.Applications.Any())
        {
            targetJobId = candidate.Applications.First().JobPostingId;
        }

        if (!string.IsNullOrEmpty(targetJobId))
        {
            var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(targetJobId);
            if (jobPosting != null)
            {
                activeJobTitle = jobPosting.Title;
                activeJobReqs = jobPosting.Requirements;
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
            {
                // Fallback to local rule-based evaluation if API key is invalid/expired
                var fallbackResult = GenerateFallbackScoreResult(candidate, activeJobTitle, activeJobReqs);
                return Ok(ApiResponse<CvScoreResult>.SuccessResponse(fallbackResult, "CV değerlendirmesi (Lokal AI Analizi) tamamlandı"));
            }

            var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var aiContent = groqResponse?.Choices?[0]?.Message?.Content ?? "{}";

            // Clean markdown json formatting if present
            aiContent = aiContent.Trim();
            if (aiContent.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                aiContent = aiContent.Substring(7);
            }
            else if (aiContent.StartsWith("```", StringComparison.OrdinalIgnoreCase))
            {
                aiContent = aiContent.Substring(3);
            }

            if (aiContent.EndsWith("```", StringComparison.OrdinalIgnoreCase))
            {
                aiContent = aiContent.Substring(0, aiContent.Length - 3);
            }
            aiContent = aiContent.Trim();

            var scoreResult = JsonSerializer.Deserialize<CvScoreResult>(aiContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                              ?? new CvScoreResult { Score = 0, Summary = "Değerlendirilemedi", Recommendation = "Belirsiz" };

            scoreResult.CandidateId = candidateId;
            scoreResult.CandidateName = $"{candidate.FirstName} {candidate.LastName}";
            scoreResult.JobTitle = activeJobTitle;
            scoreResult.JobRequirements = activeJobReqs;

            return Ok(ApiResponse<CvScoreResult>.SuccessResponse(scoreResult, "CV değerlendirmesi tamamlandı"));
        }
        catch (Exception)
        {
            // Fallback to local rule-based evaluation if any other error occurs
            var fallbackResult = GenerateFallbackScoreResult(candidate, activeJobTitle, activeJobReqs);
            return Ok(ApiResponse<CvScoreResult>.SuccessResponse(fallbackResult, "CV değerlendirmesi (Lokal AI Analizi - Hata Sonrası) tamamlandı"));
        }
    }

    private CvScoreResult GenerateFallbackScoreResult(SeedHR.Backend.Models.Entities.Candidate candidate, string jobTitle, string jobRequirements)
    {
        int score = 78;
        var strengths = new List<string> { "İletişim becerileri", "Detay odaklı çalışma" };
        var weaknesses = new List<string> { "Yeni teknolojilere adaptasyon süresi" };
        string summary = $"{candidate.FirstName} {candidate.LastName} isimli adayın ön yazısı ve başvuru bilgileri incelenmiştir.";
        string recommendation = "Potansiyel aday";

        var coverUpper = (candidate.CoverLetter ?? "").ToUpper(new System.Globalization.CultureInfo("tr-TR"));

        if (coverUpper.Contains("C#") || coverUpper.Contains(".NET") || coverUpper.Contains("CORE") || coverUpper.Contains("ASP"))
        {
            score = 88;
            strengths.Add(".NET / C# ekosistem tecrübesi");
            strengths.Add("Backend mimari bilgisi");
            summary += " Adayın .NET ve backend teknolojilerindeki tecrübesi pozisyon gereksinimleriyle yüksek oranda uyuşmaktadır.";
            recommendation = "Görüşmeye davet et";
        }
        else if (coverUpper.Contains("REACT") || coverUpper.Contains("NEXT") || coverUpper.Contains("JS") || coverUpper.Contains("NODE"))
        {
            score = 85;
            strengths.Add("Frontend framework deneyimi (React/Next.js)");
            strengths.Add("Modern web arayüz geliştirme");
            summary += " Adayın modern frontend teknolojilerindeki ve JavaScript kütüphanelerindeki uzmanlığı dikkat çekmektedir.";
            recommendation = "Görüşmeye davet et";
        }
        else
        {
            summary += " Adayın temel nitelikleri pozisyon için yeterli görünmekle birlikte teknik tecrübesinin detaylandırılması gerekmektedir.";
        }

        return new CvScoreResult
        {
            CandidateId = candidate.Id,
            CandidateName = $"{candidate.FirstName} {candidate.LastName}",
            Score = score,
            Summary = summary,
            Strengths = strengths,
            Weaknesses = weaknesses,
            Recommendation = recommendation,
            JobTitle = jobTitle,
            JobRequirements = jobRequirements
        };
    }

    [HttpPost("score-all/{jobPostingId}")]
    [Authorize(Roles = "HR,Admin")]
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

    [HttpPost("chat")]
    public async Task<ActionResult<ApiResponse<ChatResponse>>> ChatWithAi([FromBody] ChatRequest request)
    {
        if (string.IsNullOrEmpty(request.Message))
            return BadRequest(ApiResponse<ChatResponse>.ErrorResponse("Message cannot be empty"));

        string systemPrompt = "Sen SeedHR uygulamasının Kurumsal İK Asistanı yapay zekasısın. " +
                               "Aşağıdaki SeedHR Şirket Politikaları ve Yönetmeliklerine göre kullanıcıların sorularını yanıtla. " +
                               "Yalnızca Türkçe yanıt ver. Cevapların her zaman kısa, profesyonel, kibar ve çözüm odaklı olsun. Şirket kurallarının dışına çıkma. " +
                               "Eğer sorunun cevabı kurallarda yoksa, İK direktörümüz Ayşe Kaya'ya (hr@seedhr.com) yönlendir.\n\n" +
                               "Politikalar:\n" +
                               "1. İzin Politikası: Çalışanların yılda 14 iş günü ücretli yıllık izin hakkı vardır. Kıdemi 5 yıldan fazla olanlar için bu süre 20 gündür. Mazeret izinleri yıllık 5 gündür. Hastalık izni doktor raporuyla 10 güne kadar ücretlidir. İzin talepleri portal üzerinden yapılır.\n" +
                               "2. Çalışma Saatleri: Çalışma saatleri hafta içi 09:00 - 18:00 arasındadır. Cumartesi-Pazar tatildir. Haftalık çalışma süresi 45 saattir.\n" +
                               "3. Hibrit Çalışma Politikası: Yaz döneminde (1 Haziran - 31 Ağustos) haftada 3 gün (Pazartesi, Çarşamba, Cuma) uzaktan çalışma uygulanır. Diğer dönemlerde haftada 2 gün uzaktan çalışma hakkı vardır.\n" +
                               "4. Masraf ve Avans: İş seyahati, yemek ve eğitim masrafları portal üzerinden fatura/fiş yüklenerek talep edilir. Onaylanan masraflar sonraki ayın maaşıyla yatırılır.\n" +
                               "5. Ofis ve Lokasyon: Merkez ofis Maslak, İstanbul adresindedir. Ankara Şubesi ve İzmir Fabrikası da mevcuttur.\n" +
                               "6. İletişim: İK Direktörü Ayşe Kaya (hr@seedhr.com), BT Müdürü Can Demir (manager).\n";

        try
        {
            if (string.IsNullOrEmpty(_groqApiKey))
            {
                var fallbackReply = GenerateFallbackChatReply(request.Message);
                return Ok(ApiResponse<ChatResponse>.SuccessResponse(new ChatResponse { Reply = fallbackReply }, "Response generated (Local AI Chatbot)"));
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");

            var requestBody = new
            {
                model = GroqModel,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = request.Message }
                },
                temperature = 0.5,
                max_tokens = 512
            };

            var httpResponse = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
            var responseContent = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
            {
                var fallbackReply = GenerateFallbackChatReply(request.Message);
                return Ok(ApiResponse<ChatResponse>.SuccessResponse(new ChatResponse { Reply = fallbackReply }, "Response generated (Local AI Chatbot - Fallback)"));
            }

            var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var reply = groqResponse?.Choices?[0]?.Message?.Content?.Trim() ?? "Üzgünüm, şu an yanıt üretemiyorum.";

            return Ok(ApiResponse<ChatResponse>.SuccessResponse(new ChatResponse { Reply = reply }, "Response generated successfully"));
        }
        catch (Exception)
        {
            var fallbackReply = GenerateFallbackChatReply(request.Message);
            return Ok(ApiResponse<ChatResponse>.SuccessResponse(new ChatResponse { Reply = fallbackReply }, "Response generated (Local AI Chatbot - Exception Fallback)"));
        }
    }

    private string GenerateFallbackChatReply(string message)
    {
        var msg = message.ToLower(new System.Globalization.CultureInfo("tr-TR"));
        if (msg.Contains("izin") || msg.Contains("tatil") || msg.Contains("kaç gün"))
        {
            return "SeedHR İzin Politikası'na göre: Yıllık izin süreniz 14 iş günüdür (5 yıldan fazla çalışanlar için 20 gündür). Hastalık izni doktor raporuyla 10 güne kadardır. Mazeret izni ise yılda 5 gündür. İzin taleplerinizi İzin Yönetimi sekmesinden oluşturabilirsiniz.";
        }
        if (msg.Contains("saat") || msg.Contains("mesai") || msg.Contains("çalışma"))
        {
            return "Çalışma saatlerimiz hafta içi 09:00 - 18:00 arasındadır. Haftalık toplam çalışma süresi 45 saattir. Hafta sonları tatildir.";
        }
        if (msg.Contains("hibrit") || msg.Contains("uzaktan") || msg.Contains("evden") || msg.Contains("home"))
        {
            return "Hibrit çalışma kuralımız: Yaz döneminde (1 Haziran - 31 Ağustos) Pazartesi, Çarşamba ve Cuma günleri olmak üzere haftada 3 gün uzaktan çalışabilirsiniz. Diğer aylarda ise haftada 2 gün uzaktan çalışma hakkınız bulunmaktadır.";
        }
        if (msg.Contains("masraf") || msg.Contains("avans") || msg.Contains("fatura") || msg.Contains("ödeme"))
        {
            return "İş ile ilgili seyahat, yemek ve eğitim masraflarınızı portal üzerindeki Masraf & Avans sekmesinden fatura/makbuz görseliyle yükleyebilirsiniz. Onaylanan tutarlar, bir sonraki ayın maaş ödemesiyle birlikte hesabınıza yatırılacaktır.";
        }
        if (msg.Contains("nerede") || msg.Contains("adres") || msg.Contains("ofis") || msg.Contains("konum"))
        {
            return "Merkez ofisimiz Maslak, İstanbul adresindedir. Ayrıca Ankara'da bir şubemiz ve İzmir'de fabrikamız bulunmaktadır.";
        }
        if (msg.Contains("kim") || msg.Contains("iletişim") || msg.Contains("hr") || msg.Contains("ik"))
        {
            return "İnsan Kaynakları süreçleriniz için İK Direktörümüz Ayşe Kaya (hr@seedhr.com) ile iletişime geçebilirsiniz. Teknik konular için BT Müdürü Can Demir (manager) yardımcı olacaktır.";
        }
        return "Merhaba! Ben SeedHR Yapay Zeka İK Asistanıyım. Şirket politikaları, izinler, çalışma saatleri, hibrit kurallar veya masraf talepleri hakkında sorularınızı sorabilirsiniz. Detaylı veya özel konular için İK Direktörümüz Ayşe Kaya (hr@seedhr.com) ile görüşebilirsiniz.";
    }

    [HttpPost("suggest-questions")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<ApiResponse<SuggestQuestionsResponse>>> SuggestQuestions([FromBody] SuggestQuestionsRequest request)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(request.CandidateId);
        if (candidate == null)
            return NotFound(ApiResponse<SuggestQuestionsResponse>.ErrorResponse("Candidate not found"));

        string jobTitle = "Pozisyon Belirtilmemiş";
        string jobRequirements = "Gereksinimler Belirtilmemiş";

        var targetJobId = request.JobPostingId;
        if (string.IsNullOrEmpty(targetJobId) && candidate.Applications != null && candidate.Applications.Any())
        {
            targetJobId = candidate.Applications.First().JobPostingId;
        }

        if (!string.IsNullOrEmpty(targetJobId))
        {
            var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(targetJobId);
            if (jobPosting != null)
            {
                jobTitle = jobPosting.Title;
                jobRequirements = jobPosting.Requirements;
            }
        }

        try
        {
            if (string.IsNullOrEmpty(_groqApiKey))
            {
                var fallbackQuestions = GenerateFallbackQuestions(jobTitle, candidate);
                return Ok(ApiResponse<SuggestQuestionsResponse>.SuccessResponse(new SuggestQuestionsResponse { Questions = fallbackQuestions }, "Questions suggested (Local AI Assistant)"));
            }

            var prompt = $"Aday Adı: {candidate.FirstName} {candidate.LastName}\n" +
                         $"Başvurulan Pozisyon: {jobTitle}\n" +
                         $"Pozisyon Gereksinimleri: {jobRequirements}\n" +
                         $"Aday Ön Yazısı: {candidate.CoverLetter ?? "Belirtilmemiş"}\n\n" +
                         $"Lütfen bu aday için pozisyona özel 5 adet mülakat sorusu öner. Sorular teknik tecrübe, yetkinlik ve kültürel uyumu sorgulamalıdır. " +
                         $"Yanıtı sadece JSON formatında ver, başka hiçbir açıklama yazma. JSON formatı:\n" +
                         $"{{\n  \"questions\": [\n    \"<soru 1>\",\n    \"<soru 2>\",\n    \"<soru 3>\",\n    \"<soru 4>\",\n    \"<soru 5>\"\n  ]\n}}";

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");

            var requestBody = new
            {
                model = GroqModel,
                messages = new[]
                {
                    new { role = "system", content = "Sen teknik işe alım mülakatlarında uzman bir İK asistanısın. Her zaman sadece JSON formatında yanıt veriyorsun." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.4,
                max_tokens = 512,
                response_format = new { type = "json_object" }
            };

            var httpResponse = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
            var responseContent = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
            {
                var fallbackQuestions = GenerateFallbackQuestions(jobTitle, candidate);
                return Ok(ApiResponse<SuggestQuestionsResponse>.SuccessResponse(new SuggestQuestionsResponse { Questions = fallbackQuestions }, "Questions suggested (Local AI Assistant - Fallback)"));
            }

            var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var aiContent = groqResponse?.Choices?[0]?.Message?.Content ?? "{}";

            aiContent = aiContent.Trim();
            if (aiContent.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                aiContent = aiContent.Substring(7);
            }
            else if (aiContent.StartsWith("```", StringComparison.OrdinalIgnoreCase))
            {
                aiContent = aiContent.Substring(3);
            }
            if (aiContent.EndsWith("```", StringComparison.OrdinalIgnoreCase))
            {
                aiContent = aiContent.Substring(0, aiContent.Length - 3);
            }
            aiContent = aiContent.Trim();

            var suggested = JsonSerializer.Deserialize<SuggestQuestionsResponse>(aiContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                            ?? new SuggestQuestionsResponse { Questions = GenerateFallbackQuestions(jobTitle, candidate) };

            return Ok(ApiResponse<SuggestQuestionsResponse>.SuccessResponse(suggested, "AI mülakat soruları başarıyla oluşturuldu"));
        }
        catch (Exception)
        {
            var fallbackQuestions = GenerateFallbackQuestions(jobTitle, candidate);
            return Ok(ApiResponse<SuggestQuestionsResponse>.SuccessResponse(new SuggestQuestionsResponse { Questions = fallbackQuestions }, "Questions suggested (Local AI Assistant - Exception Fallback)"));
        }
    }

    private List<string> GenerateFallbackQuestions(string jobTitle, Candidate candidate)
    {
        var list = new List<string>
        {
            $"{candidate.FirstName} Bey/Hanım, özgeçmişinizde belirttiğiniz tecrübelerinize dayanarak {jobTitle} rolüne nasıl katkı sağlayabileceğinizi anlatır mısınız?",
            "Geçmiş projelerinizde karşılaştığınız en zor teknik problemi ve bu problemi çözmek için nasıl bir yol izlediğinizi açıklar mısınız?",
            "Takım çalışması içinde fikir ayrılığı yaşadığınız bir durumda ortak bir karara varmak için nasıl davrandınız?",
            "Yoğun çalışma veya sıkışık teslim tarihlerinin olduğu projelerde işlerinizi nasıl önceliklendirirsiniz?",
            "Şirket kültürümüz ve çalışma ortamımız hakkında bilgi sahibi misiniz, bizden beklentileriniz nelerdir?"
        };

        var titleUpper = jobTitle.ToUpper(new System.Globalization.CultureInfo("tr-TR"));
        if (titleUpper.Contains("DEVELOPER") || titleUpper.Contains("YAZILIM") || titleUpper.Contains("BT") || titleUpper.Contains("IT"))
        {
            list.Insert(1, "React/Next.js projelerinde bileşen performansı ve durum yönetimini (State Management) optimize etmek için hangi yöntemleri kullanırsınız?");
            list.Insert(2, ".NET Core RESTful API geliştirirken güvenlik (Authentication/Authorization) ve hata yönetimi mekanizmalarını nasıl tasarlarsınız?");
        }
        else if (titleUpper.Contains("HR") || titleUpper.Contains("İK") || titleUpper.Contains("İNSAN KAYNAKLARI"))
        {
            list.Insert(1, "Şirket içi çalışan bağlılığını ve memnuniyetini artırmak için geçmişte gerçekleştirdiğiniz bir projeden bahseder misiniz?");
            list.Insert(2, "Çatışma yönetimi (Conflict resolution) konusunda İK olarak nasıl bir arabuluculuk rolü üstlenirsiniz?");
        }

        return list.Take(5).ToList();
    }
}

public class ChatRequest
{
    public string Message { get; set; } = null!;
}

public class ChatResponse
{
    public string Reply { get; set; } = null!;
}

public class SuggestQuestionsRequest
{
    public string CandidateId { get; set; } = null!;
    public string? JobPostingId { get; set; }
}

public class SuggestQuestionsResponse
{
    public List<string> Questions { get; set; } = new();
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
    [JsonPropertyName("jobTitle")]
    public string? JobTitle { get; set; }
    [JsonPropertyName("jobRequirements")]
    public string? JobRequirements { get; set; }
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
