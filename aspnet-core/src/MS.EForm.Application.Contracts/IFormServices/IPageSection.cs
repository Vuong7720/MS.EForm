using MS.EForm.FormModels.PageSections;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace EForm.IFormServices
{
	public interface IPageSection
	{
		Task<MessageDto> CreatePageSection(CreateUpdatePageSectionDto model);
		Task<MessageDto> UpdatePageSection(Guid id, CreateUpdatePageSectionDto model);
		Task<MessageDto> DeletePageSection(Guid id);
		Task<PagedResultDto<PageSectionDto>> GetAllPageSectionsPagedAsync(PageSectionPagingDto page);
		Task<PageSectionDto> GetPageSectionById(Guid id);
		Task<MessageDto> ReorderPageSections(List<Guid> orderedIds);
		Task<PageSectionDto?> GetEmbedSection(Guid id);
	}
}
