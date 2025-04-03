using EForm.FormModels;
using MS.EForm.FormModels.FormFields;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EForm.IFormServices
{
	public interface IFormField 
	{
		Task<MessageDto> CreateFormField(CreateUpdateFormField model);
		Task<MessageDto> UpdateFormField(Guid id, CreateUpdateFormField model);
		Task<MessageDto> DeleteFormField(Guid id);
		Task<List<FormFieldDto>> GetAllFormField();
		Task<FormFieldDto> GetFormFieldById(Guid id);
		Task<PagedResultDto<FormFieldDto>> GetAllFormFieldPagedAsync(int pageNumber, int pageSize);
		Task<List<FormFieldDto>> GetFieldByFormId(Guid formId);
	}
}
