using EForm.IFormServices;
using EForm;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MS.EForm.Localization;
using MS.EForm.Permissions;
using System.Threading.Tasks;
using System;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;
using EForm.FormModels;
using MS.EForm.FormModels.FormCategories;
using MS.EForm.FormModels.FormFields;
using MS.EForm.FormModels.Forms;
using MS.EForm.FormModels.FormRecords;

namespace MS.EForm.Controllers;

[Area(EFormServiceRemoteServiceConsts.ModuleName)]
[RemoteService(Name = EFormServiceRemoteServiceConsts.RemoteServiceName)]
[Route("api/eform")]
public class EFormController : AbpControllerBase
{
	private IFormCategory _formCategory;
	private IFormField _formField;
	private IFormService _formService;
	private IFormRecord _formRecord;
	public EFormController(
		IFormCategory formCategory,
		IFormField formField,
		IFormService formService,
		IFormRecord formRecord
		)
	{
		_formCategory = formCategory;
		_formField = formField;
		_formService = formService;
		_formRecord = formRecord;
	}

	#region Danh mục form

	[Authorize(EFormPermissions.FormCategories.Create)]
	[HttpPost("create-form-category")]
	public async Task<MessageDto> CreateFormCategory(CreateUpdateFormCateDto model)
	{
		return await _formCategory.CreateFormCategory(model);
	}

	[Authorize(EFormPermissions.FormCategories.Edit)]
	[HttpPut("edit-form-category")]
	public async Task<MessageDto> UpdateFormCategory(Guid id, CreateUpdateFormCateDto model)
	{
		return await _formCategory.UpdateFormCategory(id, model);
	}

	[Authorize(EFormPermissions.FormCategories.Delete)]
	[HttpDelete("delete-form-category")]
	public async Task<MessageDto> DeleteFormCategory(Guid id)
	{
		return await _formCategory.DeleteFormCategory(id);
	}

	[Authorize(EFormPermissions.FormCategories.Delete)]
	[HttpDelete("delete-multi-form-category")]
	public async Task<MessageDto> DeleteMultiFormCategory(List<Guid> ids)
	{
		return await _formCategory.DeleteMultiFormCategory(ids);
	}

	[Authorize(EFormPermissions.FormCategories.Default)]
	[HttpGet("get-all-form-category")]
	public async Task<List<FormCategoryDto>> GetAllFormCate()
	{
		return await _formCategory.GetAllFormCate();
	}

	[Authorize(EFormPermissions.FormCategories.Default)]
	[HttpGet("get-paging-form-category")]
	public async Task<PagedResultDto<FormCategoryDto>> GetAllFormCatePagedAsync(CatePagingDto page)
	{
		return await _formCategory.GetAllFormCatePagedAsync(page);
	}

	[Authorize(EFormPermissions.FormCategories.Default)]
	[HttpGet("get-category-by-id")]
	public async Task<FormCategoryDto> GetCategoryById(Guid id)
	{
		return await _formCategory.GetCategoryById(id);
	}

	#endregion


	#region FormField

	[Authorize(EFormPermissions.FormFields.Create)]
	[HttpPost("create-form-field")]
	public async Task<MessageDto> CreateFormField(CreateUpdateFormField model)
	{
		return await _formField.CreateFormField(model);
	}

	[Authorize(EFormPermissions.FormFields.Edit)]
	[HttpPut("edit-form-field")]
	public async Task<MessageDto> UpdateFormField(Guid id, CreateUpdateFormField model)
	{
		return await _formField.UpdateFormField(id, model);
	}

	[Authorize(EFormPermissions.FormFields.Delete)]
	[HttpDelete("delete-form-field")]
	public async Task<MessageDto> DeleteFormField(Guid id)
	{
		return await _formField.DeleteFormField(id);
	}

	[Authorize(EFormPermissions.FormFields.Default)]
	[HttpGet("get-all-form-field")]
	public async Task<List<FormFieldDto>> GetAllFormField()
	{
		return await _formField.GetAllFormField();
	}

	[Authorize(EFormPermissions.FormFields.Default)]
	[HttpGet("get-form-field-by-id")]
	public async Task<FormFieldDto> GetFormFieldById(Guid id)
	{
		return await _formField.GetFormFieldById(id);
	}

	[Authorize(EFormPermissions.FormFields.Default)]
	[HttpGet("get-paging-form-field")]
	public async Task<PagedResultDto<FormFieldDto>> GetAllFormFieldPagedAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
	{
		return await _formField.GetAllFormFieldPagedAsync(pageNumber, pageSize);
	}

	// Không Authorize: trang nộp form public (/submit-form/:formId) cũng gọi endpoint này để lấy danh sách field cần render
	[HttpGet("get-form-field-by-formid")]
	public async Task<List<FormFieldDto>> GetFieldByFormId(Guid formId)
	{
		return await _formField.GetFieldByFormId(formId);
	}

	#endregion

	#region Form
	[Authorize(EFormPermissions.Forms.Create)]
	[HttpPost("create-form")]
	public async Task<MessageDto> CreateAsync(CreateUpdateForm model)
	{
		return await _formService.CreateAsync(model);
	}

	[Authorize(EFormPermissions.Forms.Edit)]
	[HttpPut("edit-form")]
	public async Task<MessageDto> UpdateAsync(Guid id, CreateUpdateForm model)
	{
		return await _formService.UpdateAsync(id, model);
	}

	[Authorize(EFormPermissions.Forms.Delete)]
	[HttpDelete("delete-form")]
	public async Task<MessageDto> DeleteAsync(Guid id)
	{
		return await _formService.DeleteAsync(id);
	}

	[Authorize(EFormPermissions.Forms.Default)]
	[HttpGet("get-all-form")]
	public async Task<List<FormDto>> GetAllForm()
	{
		return await _formService.GetAllForm();
	}

	// Không Authorize: trang nộp form public (/submit-form/:formId) cũng gọi endpoint này để lấy tiêu đề/nội dung form
	[HttpGet("get-form-by-id")]
	public async Task<FormDto> GetAsync(Guid id)
	{
		return await _formService.GetAsync(id);
	}

	[Authorize(EFormPermissions.Forms.Default)]
	[HttpGet("get-paging-form")]
	public async Task<PagedResultDto<FormDto>> GetListAsync(FormPagingFilterDto page)
	{
		return await _formService.GetListAsync(page);
	}
	#endregion

	#region FormRecord

	// Cố tình để public, không Authorize: đây là endpoint nộp form cho người ngoài hệ thống điền qua /submit-form/:formId
	// Giới hạn 10 request/phút/IP (policy "submit-form", cấu hình ở EFormHttpApiHostModule) để giảm rủi ro spam.
	// TODO: cân nhắc thêm captcha nếu spam vẫn xảy ra qua nhiều IP khác nhau (rate-limit theo IP không chặn được).
	[EnableRateLimiting("submit-form")]
	[HttpPost("submit-form-record")]
	public async Task<MessageDto> SubmitFormRecord(CreateUpdateFormRecordDto model)
	{
		return await _formRecord.SubmitAsync(model);
	}

	[Authorize(EFormPermissions.FormRecords.Edit)]
	[HttpPut("edit-form-record")]
	public async Task<MessageDto> UpdateFormRecord(Guid id, CreateUpdateFormRecordDto model)
	{
		return await _formRecord.UpdateAsync(id, model);
	}

	[Authorize(EFormPermissions.FormRecords.Delete)]
	[HttpDelete("delete-form-record")]
	public async Task<MessageDto> DeleteFormRecord(Guid id)
	{
		return await _formRecord.DeleteAsync(id);
	}

	[Authorize(EFormPermissions.FormRecords.Approve)]
	[HttpPost("approve-form-record")]
	public async Task<MessageDto> ApproveFormRecord(Guid id, string? note)
	{
		return await _formRecord.ApproveAsync(id, note);
	}

	[Authorize(EFormPermissions.FormRecords.Approve)]
	[HttpPost("reject-form-record")]
	public async Task<MessageDto> RejectFormRecord(Guid id, string? note)
	{
		return await _formRecord.RejectAsync(id, note);
	}

	[Authorize(EFormPermissions.FormRecords.Default)]
	[HttpGet("get-form-record-by-id")]
	public async Task<FormRecordDto> GetFormRecordById(Guid id)
	{
		return await _formRecord.GetAsync(id);
	}

	[Authorize(EFormPermissions.FormRecords.Default)]
	[HttpGet("get-paging-form-record")]
	public async Task<PagedResultDto<FormRecordDto>> GetPagingFormRecord(FormRecordPagingFilterDto page)
	{
		return await _formRecord.GetListAsync(page);
	}

	[Authorize(EFormPermissions.FormRecords.Default)]
	[HttpGet("export-excel-form-record")]
	public async Task<IActionResult> ExportExcelFormRecord(Guid formId)
	{
		var bytes = await _formRecord.ExportExcelAsync(formId);
		return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"ket-qua-{formId}.xlsx");
	}

	[Authorize]
	[HttpGet("get-dashboard-stats")]
	public async Task<DashboardStatsDto> GetDashboardStats()
	{
		return await _formRecord.GetDashboardStatsAsync();
	}

	// Cố tình để public, không Authorize: field kiểu "Upload file/ảnh" cần upload được ngay trên trang
	// nộp form public, trước khi submit-form-record. Dùng chung policy rate-limit với submit-form-record.
	[EnableRateLimiting("submit-form")]
	[RequestSizeLimit(20 * 1024 * 1024)]
	[HttpPost("upload-form-attachment")]
	public async Task<UploadAttachmentResultDto> UploadFormAttachment([FromForm] Guid formId, [FromForm] string fieldCode, IFormFile file)
	{
		if (file == null || file.Length == 0)
		{
			throw new UserFriendlyException("Không có file được tải lên");
		}

		await using var stream = file.OpenReadStream();
		return await _formRecord.UploadAttachmentAsync(formId, fieldCode, file.FileName, file.Length, stream);
	}

	// Tải file đính kèm về xem/kiểm tra kết quả nộp form - chỉ người có quyền xem kết quả mới tải được
	[Authorize(EFormPermissions.FormRecords.Default)]
	[HttpGet("download-form-attachment")]
	public async Task<IActionResult> DownloadFormAttachment(string blobName, string fileName)
	{
		var stream = await _formRecord.DownloadAttachmentAsync(blobName);
		return File(stream, "application/octet-stream", fileName);
	}

	#endregion

}
