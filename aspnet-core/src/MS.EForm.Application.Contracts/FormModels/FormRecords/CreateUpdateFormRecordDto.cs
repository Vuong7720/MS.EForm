using System;

namespace MS.EForm.FormModels.FormRecords
{
	public class CreateUpdateFormRecordDto
	{
		public string Title { get; set; }
		public Guid FormId { get; set; }
		public string Data { get; set; }
		// chỉ dùng khi nộp mới (SubmitAsync) - UpdateAsync (đã đăng nhập, có quyền Edit) không cần captcha
		public string? CaptchaToken { get; set; }
	}
}
