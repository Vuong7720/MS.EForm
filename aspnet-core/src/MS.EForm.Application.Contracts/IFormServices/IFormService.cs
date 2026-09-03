using MS.EForm.FormModels.Forms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EForm.IFormServices
{
	public interface IFormService
	{
		Task<MessageDto> CreateAsync(CreateUpdateForm model);
		Task<MessageDto> UpdateAsync(Guid id, CreateUpdateForm model);
		// nhân bản 1 form đã có (nội dung + toàn bộ field) thành 1 form mới, tự đặt tên tránh trùng
		Task<MessageDto> DuplicateAsync(Guid id);
		Task<MessageDto> DeleteAsync(Guid id);
		Task<List<FormDto>> GetAllForm();
		Task<FormDto> GetAsync(Guid id);
		Task<PagedResultDto<FormDto>> GetListAsync(FormPagingFilterDto page);
	}
}
