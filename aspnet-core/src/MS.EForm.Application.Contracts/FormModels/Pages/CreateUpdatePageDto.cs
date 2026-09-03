namespace MS.EForm.FormModels.Pages
{
	public class CreateUpdatePageDto
	{
		public string Title { get; set; }
		public string Slug { get; set; }
		public string? Description { get; set; }
		public bool IsActive { get; set; }
		public string? PrimaryColor { get; set; }
		public string? BrandName { get; set; }
	}
}
