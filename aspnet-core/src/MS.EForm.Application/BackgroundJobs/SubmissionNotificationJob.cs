using EForm.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Emailing;
using Volo.Abp.Identity;

namespace MS.EForm.BackgroundJobs
{
	public class SubmissionNotificationArgs
	{
		public Guid FormRecordId { get; set; }
	}

	// gửi email cho người tạo form (Form.CreatorId) khi có bản ghi mới nộp vào form có bật NotifyOnSubmit.
	// Chạy nền (không đồng bộ trong SubmitAsync) để endpoint nộp form public không bị chậm/lỗi vì SMTP.
	public class SubmissionNotificationJob : AsyncBackgroundJob<SubmissionNotificationArgs>, ITransientDependency
	{
		private readonly IRepository<FormRecord, Guid> _recordRepository;
		private readonly IRepository<Form, Guid> _formRepository;
		private readonly IIdentityUserRepository _userRepository;
		private readonly IEmailSender _emailSender;
		private readonly IConfiguration _configuration;

		public SubmissionNotificationJob(
			IRepository<FormRecord, Guid> recordRepository,
			IRepository<Form, Guid> formRepository,
			IIdentityUserRepository userRepository,
			IEmailSender emailSender,
			IConfiguration configuration)
		{
			_recordRepository = recordRepository;
			_formRepository = formRepository;
			_userRepository = userRepository;
			_emailSender = emailSender;
			_configuration = configuration;
		}

		public override async Task ExecuteAsync(SubmissionNotificationArgs args)
		{
			var record = await _recordRepository.FindAsync(args.FormRecordId);
			if (record == null) return;

			var form = await _formRepository.FindAsync(record.FormId);
			if (form == null || form.CreatorId == null) return;

			var creator = await _userRepository.FindAsync(form.CreatorId.Value);
			if (creator == null || string.IsNullOrWhiteSpace(creator.Email)) return;

			var clientUrl = (_configuration["App:ClientUrl"] ?? "").TrimEnd('/');
			var approvalNote = form.RequireApproval ? "\nForm này yêu cầu phê duyệt - vui lòng vào hệ thống để duyệt." : "";

			var body =
				$"Có bản ghi mới vừa được nộp vào form \"{form.Title}\".\n" +
				$"Tiêu đề bản ghi: {record.Title}\n" +
				$"Thời gian nộp: {record.CreationTime:dd/MM/yyyy HH:mm}" +
				approvalNote +
				(string.IsNullOrEmpty(clientUrl) ? "" : $"\n\nXem chi tiết: {clientUrl}/form-records/view/{record.Id}");

			await _emailSender.SendAsync(
				creator.Email,
				$"[EForm] Có bản ghi mới nộp vào form \"{form.Title}\"",
				body,
				isBodyHtml: false
			);
		}
	}
}
