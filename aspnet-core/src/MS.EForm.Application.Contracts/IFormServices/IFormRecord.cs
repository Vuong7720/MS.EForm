using EForm.FormModels;
using MS.EForm.FormModels.FormRecords;
using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace EForm.IFormServices
{
	public interface IFormRecord
	{
		Task<MessageDto> SubmitAsync(CreateUpdateFormRecordDto model);
		Task<MessageDto> UpdateAsync(Guid id, CreateUpdateFormRecordDto model);
		Task<MessageDto> DeleteAsync(Guid id);
		Task<FormRecordDto> GetAsync(Guid id);
		Task<PagedResultDto<FormRecordDto>> GetListAsync(FormRecordPagingFilterDto page);
	}
}
