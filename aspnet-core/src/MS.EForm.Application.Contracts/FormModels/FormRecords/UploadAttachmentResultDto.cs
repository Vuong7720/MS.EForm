namespace MS.EForm.FormModels.FormRecords
{
	// kết quả upload 1 file đính kèm cho field kiểu "Upload file/ảnh" (TypeField.File),
	// client gộp các kết quả này thành mảng JSON để lưu vào FormRecord.Data[code]
	public class UploadAttachmentResultDto
	{
		public string Blob { get; set; } = string.Empty;
		public string Name { get; set; } = string.Empty;
		public long Size { get; set; }
	}
}
