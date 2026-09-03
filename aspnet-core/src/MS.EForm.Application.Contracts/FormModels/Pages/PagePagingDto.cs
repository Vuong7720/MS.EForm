namespace MS.EForm.FormModels.Pages
{
	public class PagePagingDto
	{
		public string? Title { get; set; }
		public int PageSize { get; set; } = 10;
		public int PageIndex { get; set; } = 1;
	}
}
