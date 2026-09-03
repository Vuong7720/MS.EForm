using System;
using MS.EForm.Enums;

namespace MS.EForm.FormModels.PageSections
{
	public class CreateUpdatePageSectionDto
	{
		public string Title { get; set; }
		public string? Description { get; set; }
		public PageSectionType SectionType { get; set; } = PageSectionType.Form;
		public Guid? FormId { get; set; }
		public string? Content { get; set; }
		public Guid PageId { get; set; }
		public int DisplayOrder { get; set; }
		public bool IsActive { get; set; }
		public DateTime? StartDate { get; set; }
		public DateTime? EndDate { get; set; }
	}
}
