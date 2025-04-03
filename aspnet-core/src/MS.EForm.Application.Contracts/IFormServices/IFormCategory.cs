using MS.EForm.FormModels.FormCategories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EForm.IFormServices
{
	public interface IFormCategory
	{
		Task<MessageDto> CreateFormCategory(CreateUpdateFormCateDto model);
		Task<MessageDto> UpdateFormCategory(Guid id, CreateUpdateFormCateDto model);
		Task<MessageDto> DeleteFormCategory(Guid id);
		Task<MessageDto> DeleteMultiFormCategory(List<Guid> ids);
		Task<List<FormCategoryDto>> GetAllFormCate();
		Task<PagedResultDto<FormCategoryDto>> GetAllFormCatePagedAsync(int pageNumber, int pageSize);
		Task<FormCategoryDto> GetCategoryById(Guid id);
	}
}
