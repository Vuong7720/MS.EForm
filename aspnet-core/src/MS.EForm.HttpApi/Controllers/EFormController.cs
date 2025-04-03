using EForm.IFormServices;
using EForm;
using Microsoft.AspNetCore.Mvc;
using MS.EForm.Localization;
using System.Threading.Tasks;
using System;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;
using MS.EForm.FormModels.FormCategories;
using MS.EForm.FormModels.FormFields;
using MS.EForm.FormModels.Forms;

namespace MS.EForm.Controllers;

[Area(EFormServiceRemoteServiceConsts.ModuleName)]
[RemoteService(Name = EFormServiceRemoteServiceConsts.RemoteServiceName)]
[Route("api/eform")]
public class EFormController : AbpControllerBase
{
	private IFormCategory _formCategory;
	private IFormField _formField;
	private IFormService _formService;
	public EFormController(
		IFormCategory formCategory,
		IFormField formField,
		IFormService formService
		)
	{
		_formCategory = formCategory;
		_formField = formField;
		_formService = formService;
	}

	#region Danh mục form

	[HttpPost("create-form-category")]
	public async Task<MessageDto> CreateFormCategory(CreateUpdateFormCateDto model)
	{
		return await _formCategory.CreateFormCategory(model);
	}

	[HttpPut("edit-form-category")]
	public async Task<MessageDto> UpdateFormCategory(Guid id, CreateUpdateFormCateDto model)
	{
		return await _formCategory.UpdateFormCategory(id, model);
	}

	[HttpDelete("delete-form-category")]
	public async Task<MessageDto> DeleteFormCategory(Guid id)
	{
		return await _formCategory.DeleteFormCategory(id);
	}

	[HttpDelete("delete-multi-form-category")]
	public async Task<MessageDto> DeleteMultiFormCategory(List<Guid> ids)
	{
		return await _formCategory.DeleteMultiFormCategory(ids);	
	}

	[HttpGet("get-all-form-category")]
	public async Task<List<FormCategoryDto>> GetAllFormCate()
	{
		return await _formCategory.GetAllFormCate();
	}

	[HttpGet("get-paging-form-category")]
	public async Task<PagedResultDto<FormCategoryDto>> GetAllFormCatePagedAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
	{
		return await _formCategory.GetAllFormCatePagedAsync(pageNumber, pageSize);
	}

	[HttpGet("get-category-by-id")]
	public async Task<FormCategoryDto> GetCategoryById(Guid id)
	{
		return await _formCategory.GetCategoryById(id);
	}

	#endregion


	#region FormField

	[HttpPost("create-form-field")]
	public async Task<MessageDto> CreateFormField(CreateUpdateFormField model)
	{
		return await _formField.CreateFormField(model);
	}

	[HttpPut("edit-form-field")]
	public async Task<MessageDto> UpdateFormField(Guid id, CreateUpdateFormField model)
	{
		return await _formField.UpdateFormField(id, model);
	}

	[HttpDelete("delete-form-field")]
	public async Task<MessageDto> DeleteFormField(Guid id)
	{
		return await _formField.DeleteFormField(id);
	}

	[HttpGet("get-all-form-field")]
	public async Task<List<FormFieldDto>> GetAllFormField()
	{
		return await _formField.GetAllFormField();
	}

	[HttpGet("get-form-field-by-id")]
	public async Task<FormFieldDto> GetFormFieldById(Guid id)
	{
		return await _formField.GetFormFieldById(id);
	}

	[HttpGet("get-paging-form-field")]
	public async Task<PagedResultDto<FormFieldDto>> GetAllFormFieldPagedAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
	{
		return await _formField.GetAllFormFieldPagedAsync(pageNumber, pageSize);
	}

	[HttpGet("get-form-field-by-formid")]
	public async Task<List<FormFieldDto>> GetFieldByFormId(Guid formId)
	{
		return await _formField.GetFieldByFormId(formId);
	}

	#endregion

	#region Form
	[HttpPost("create-form")]
	public async Task<MessageDto> CreateAsync(CreateUpdateForm model)
	{
		return await _formService.CreateAsync(model);
	}

	[HttpPut("edit-form")]
	public async Task<MessageDto> UpdateAsync(Guid id, CreateUpdateForm model)
	{
		return await _formService.UpdateAsync(id, model);
	}

	[HttpDelete("delete-form")]
	public async Task<MessageDto> DeleteAsync(Guid id)
	{
		return await _formService.DeleteAsync(id);
	}

	[HttpGet("get-all-form")]
	public async Task<List<FormDto>> GetAllForm()
	{
		return await _formService.GetAllForm();
	}

	[HttpGet("get-form-by-id")]
	public async Task<FormDto> GetAsync(Guid id)
	{
		return await _formService.GetAsync(id);
	}

	[HttpGet("get-paging-form")]
	public async Task<PagedResultDto<FormDto>> GetListAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
	{
		return await _formService.GetListAsync(pageNumber, pageSize);
	}
	#endregion

}
