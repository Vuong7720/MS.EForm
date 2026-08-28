using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MS.EForm.Enums
{
	public enum TypeField
	{
		Text = 1,
		AreaText = 2,
		Select = 3,
		CheckBox = 4,
		Radio = 5,
		DateTime = 6,
		Number = 7,
		Boolean = 8,
		File = 9,
		Signature = 10,
		Rating = 11,
		// Nhóm field lặp lại (danh sách): 1 field Group chứa nhiều "field con" (định nghĩa trong
		// FieldConfig.Children), người nộp form có thể thêm/xoá từng dòng lặp - xem FormRecordService
		Group = 12
	}
}
