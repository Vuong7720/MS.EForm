using System;
using Volo.Abp.Application.Dtos;

namespace MS.EForm.FormModels.Pages
{
	public class PageDto : FullAuditedEntityDto<Guid>
	{
		public string Title { get; set; }
		public string Slug { get; set; }
		public string? Description { get; set; }
		public bool IsActive { get; set; }
		public string? PrimaryColor { get; set; }
		public string? BrandName { get; set; }
	}
}
