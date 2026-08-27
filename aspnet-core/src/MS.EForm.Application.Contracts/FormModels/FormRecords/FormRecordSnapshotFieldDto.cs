using MS.EForm.Enums;

namespace MS.EForm.FormModels.FormRecords
{
	// 1 field trong snapshot đóng băng của FormRecord - cùng cấu trúc với FormFieldDto (thiếu Id/FormId vì không cần)
	public class FormRecordSnapshotFieldDto
	{
		public string Code { get; set; }
		public string Title { get; set; }
		public TypeField Type { get; set; }
		public string? Config { get; set; }
		public string? Options { get; set; }
		public int DisplayOrder { get; set; }
	}
}
