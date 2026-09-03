namespace MS.EForm.Enums
{
	// 1 khu vực trên trang giới thiệu có thể là 1 form nhúng (như trước) HOẶC 1 khối nội dung tự soạn
	// không cần Form (poster/thông báo/nội dung tùy chỉnh bất kỳ) - xem PageSection.cs
	public enum PageSectionType
	{
		Form = 1,
		Content = 2
	}
}
