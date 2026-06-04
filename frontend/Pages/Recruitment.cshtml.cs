using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SeedHR.Frontend.Models;
using SeedHR.Frontend.Services;

namespace SeedHR.Frontend.Pages
{
    [Authorize]
    public class RecruitmentModel : PageModel
    {
        private readonly ApiService _apiService;

        public RecruitmentModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        public List<JobPostingDto> JobPostings { get; set; } = new();
        public List<CandidateDto> Candidates { get; set; } = new();
        public List<InterviewDto> Interviews { get; set; } = new();
        public List<PositionDto> Positions { get; set; } = new();

        [BindProperty]
        public CreateJobPostingRequest NewPosting { get; set; } = new();

        [BindProperty]
        public CreateInterviewRequest NewInterview { get; set; } = new();

        [BindProperty]
        public CompleteInterviewRequest Evaluation { get; set; } = new();

        [BindProperty]
        public string? TargetInterviewId { get; set; }

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await LoadDataAsync();
            return Page();
        }

        private async Task LoadDataAsync()
        {
            // 1. Fetch postings
            var postRes = await _apiService.GetJobPostingsAsync();
            if (postRes.Success && postRes.Data != null) JobPostings = postRes.Data.ToList();

            // 2. Fetch candidates
            var candRes = await _apiService.GetCandidatesAsync();
            if (candRes.Success && candRes.Data != null) Candidates = candRes.Data.ToList();

            // 3. Fetch interviews
            var intRes = await _apiService.GetInterviewsAsync();
            if (intRes.Success && intRes.Data != null) Interviews = intRes.Data.ToList();

            // 4. Fetch positions for job posting select list
            var posRes = await _apiService.GetPositionsAsync();
            if (posRes.Success && posRes.Data != null) Positions = posRes.Data.ToList();
        }

        public async Task<IActionResult> OnPostCreatePostingAsync()
        {
            if (string.IsNullOrEmpty(NewPosting.PositionId) || string.IsNullOrEmpty(NewPosting.Title) || string.IsNullOrEmpty(NewPosting.Description))
            {
                ErrorMessage = "Lütfen tüm zorunlu ilan alanlarını doldurun.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CreateJobPostingAsync(NewPosting);
            if (res.Success)
                SuccessMessage = "Yeni iş ilanı başarıyla yayınlandı.";
            else
                ErrorMessage = res.Message ?? "İş ilanı oluşturulurken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostClosePostingAsync(string id)
        {
            var res = await _apiService.CloseJobPostingAsync(id);
            if (res.Success)
                SuccessMessage = "İş ilanı başarıyla kapatıldı.";
            else
                ErrorMessage = res.Message ?? "İlan kapatılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostReopenPostingAsync(string id)
        {
            // Fetch current posting data then re-open it
            var posting = JobPostings.FirstOrDefault(p => p.Id == id);
            if (posting == null)
            {
                ErrorMessage = "İş ilanı bulunamadı.";
                await LoadDataAsync();
                return Page();
            }

            var updateReq = new UpdateJobPostingRequest
            {
                Title = posting.Title,
                Description = posting.Description,
                Requirements = posting.Requirements,
                NumberOfPositions = posting.NumberOfPositions,
                Status = "Open"
            };

            var res = await _apiService.UpdateJobPostingAsync(id, updateReq);
            if (res.Success)
                SuccessMessage = "İş ilanı yeniden açıldı.";
            else
                ErrorMessage = res.Message ?? "İlan yeniden açılırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostUpdateCandidateStatusAsync(string id, string status)
        {
            var res = await _apiService.UpdateCandidateStatusAsync(id, status);
            if (res.Success)
                SuccessMessage = "Aday durumu başarıyla güncellendi.";
            else
                ErrorMessage = res.Message ?? "Aday durumu güncellenirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostCreateInterviewAsync()
        {
            if (string.IsNullOrEmpty(NewInterview.CandidateId) || string.IsNullOrEmpty(NewInterview.JobPostingId) || NewInterview.ScheduledDate == DateTime.MinValue)
            {
                ErrorMessage = "Lütfen tüm mülakat planlama bilgilerini doldurun.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CreateInterviewAsync(NewInterview);
            if (res.Success)
                SuccessMessage = "Mülakat başarıyla planlandı ve adaya bildirildi.";
            else
                ErrorMessage = res.Message ?? "Mülakat planlanırken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostCompleteInterviewAsync()
        {
            if (string.IsNullOrEmpty(TargetInterviewId))
            {
                ErrorMessage = "Geçerli bir mülakat seçilmedi.";
                await LoadDataAsync();
                return Page();
            }

            var res = await _apiService.CompleteInterviewAsync(TargetInterviewId, Evaluation);
            if (res.Success)
                SuccessMessage = "Mülakat değerlendirmesi başarıyla kaydedildi.";
            else
                ErrorMessage = res.Message ?? "Mülakat değerlendirilirken hata oluştu.";

            await LoadDataAsync();
            return Page();
        }
    }
}
