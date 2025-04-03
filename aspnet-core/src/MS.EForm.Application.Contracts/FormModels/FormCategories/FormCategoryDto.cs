using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace MS.EForm.FormModels.FormCategories
{
	public class FormCategoryDto : FullAuditedEntityDto<Guid>
	{
		public string Title { get; set; }
		public string? Description { get; set; }
		public int Index { get; set; }
	}
}
