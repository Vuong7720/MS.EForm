using EForm.FormModels;
using MS.EForm.FormModels.FormRecords;
using System;
using System.IO;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace EForm.IFormServices
{
	public interface IFormRecord
	{
		Task<MessageDto> SubmitAsync(CreateUpdateFormRecordDto model);
		Task<MessageDto> UpdateAsync(Guid id, CreateUpdateFormRecordDto model);
		Task<MessageDto> DeleteAsync(Guid id);
		Task<MessageDto> ApproveAsync(Guid id, string? note);
		Task<MessageDto> RejectAsync(Guid id, string? note);
		Task<FormRecordDto> GetAsync(Guid id);
		Task<PagedResultDto<FormRecordDto>> GetListAsync(FormRecordPagingFilterDto page);
		Task<byte[]> ExportExcelAsync(Guid formId);
		Task<DashboardStatsDto> GetDashboardStatsAsync();
		// upload 1 file đính kèm cho field kiểu "Upload file/ảnh"; gọi trước khi submit-form-record
		Task<UploadAttachmentResultDto> UploadAttachmentAsync(Guid formId, string fieldCode, string fileName, long fileSize, Stream fileStream);
		Task<Stream> DownloadAttachmentAsync(string blobName);
	}
}
