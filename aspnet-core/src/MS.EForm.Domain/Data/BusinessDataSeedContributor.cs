using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using EForm.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace MS.EForm.Data
{
	// Nạp lại dữ liệu nghiệp vụ đã export (xem BusinessDataSeedExporter) vào 1 DB rỗng ở máy khác - tự
	// động chạy mỗi lần DbMigrator khởi động (giống FormTemplateDataSeedContributor), NHƯNG chỉ thực sự
	// làm gì khi cả 3 điều kiện sau đều đúng:
	//   1. Biến môi trường ASPNETCORE_ENVIRONMENT/DOTNET_ENVIRONMENT không phải "Production" - tránh vô
	//      tình nạp dữ liệu cá nhân/test lên bản deploy thật khi chạy DbMigrator nhắm vào Azure SQL
	//      (xem docs/DEPLOY_FREE.md - deploy thật luôn set ASPNETCORE_ENVIRONMENT=Production).
	//   2. File seed-data/business-data-seed.json tồn tại - chưa export lần nào thì bỏ qua, không lỗi.
	//   3. DB hiện đang trống (chưa có FormCategories nào) - đã seed 1 lần rồi hoặc người dùng đã tự tạo
	//      dữ liệu riêng thì không ghi đè.
	// Ghi chú: Entity<Guid>.Id chỉ có "protected set" (quy ước của ABP) nên không gán thẳng Id gốc (từ
	// máy export) lên entity mới được - phải insert để repository tự sinh Id mới, rồi map lại (oldId ->
	// newId) để gán đúng quan hệ Danh mục/Biểu mẫu/Trang cho các bảng con. SourceTemplateId (chỉ để truy
	// vết form được tạo từ mẫu nào, không ảnh hưởng chức năng) không map lại cho đơn giản - luôn để trống.
	public class BusinessDataSeedContributor : IDataSeedContributor, ITransientDependency
	{
		private readonly IConfiguration _configuration;
		private readonly ILogger<BusinessDataSeedContributor> _logger;
		private readonly IRepository<FormCategories, Guid> _categoryRepository;
		private readonly IRepository<Form, Guid> _formRepository;
		private readonly IRepository<FormField, Guid> _formFieldRepository;
		private readonly IRepository<Page, Guid> _pageRepository;
		private readonly IRepository<PageSection, Guid> _pageSectionRepository;
		private readonly IRepository<FormRecord, Guid> _formRecordRepository;

		public BusinessDataSeedContributor(
			IConfiguration configuration,
			ILogger<BusinessDataSeedContributor> logger,
			IRepository<FormCategories, Guid> categoryRepository,
			IRepository<Form, Guid> formRepository,
			IRepository<FormField, Guid> formFieldRepository,
			IRepository<Page, Guid> pageRepository,
			IRepository<PageSection, Guid> pageSectionRepository,
			IRepository<FormRecord, Guid> formRecordRepository)
		{
			_configuration = configuration;
			_logger = logger;
			_categoryRepository = categoryRepository;
			_formRepository = formRepository;
			_formFieldRepository = formFieldRepository;
			_pageRepository = pageRepository;
			_pageSectionRepository = pageSectionRepository;
			_formRecordRepository = formRecordRepository;
		}

		public async Task SeedAsync(DataSeedContext context)
		{
			var environmentName = _configuration["ASPNETCORE_ENVIRONMENT"] ?? _configuration["DOTNET_ENVIRONMENT"];
			if (string.Equals(environmentName, "Production", StringComparison.OrdinalIgnoreCase))
			{
				return;
			}

			var filePath = BusinessDataSeedPaths.SeedFilePath;
			if (!File.Exists(filePath))
			{
				return;
			}

			var existedCount = await _categoryRepository.GetCountAsync();
			if (existedCount > 0)
			{
				return;
			}

			var json = await File.ReadAllTextAsync(filePath);
			var model = JsonSerializer.Deserialize<BusinessDataSeedModel>(json);
			if (model == null)
			{
				return;
			}

			var categoryIdMap = new Dictionary<Guid, Guid>();
			foreach (var c in model.FormCategories)
			{
				var inserted = await _categoryRepository.InsertAsync(new FormCategories
				{
					Title = c.Title,
					Description = c.Description,
					Index = c.Index,
					CreationTime = c.CreationTime,
				});
				categoryIdMap[c.Id] = inserted.Id;
			}

			var formIdMap = new Dictionary<Guid, Guid>();
			foreach (var f in model.Forms)
			{
				Guid? newCategoryId = f.CategoryId.HasValue && categoryIdMap.TryGetValue(f.CategoryId.Value, out var mappedCategoryId)
					? mappedCategoryId
					: null;

				var inserted = await _formRepository.InsertAsync(new Form
				{
					Title = f.Title,
					Content = f.Content,
					Description = f.Description,
					CategoryId = newCategoryId,
					IsTemplate = f.IsTemplate,
					RequireApproval = f.RequireApproval,
					NotifyOnSubmit = f.NotifyOnSubmit,
					CreationTime = f.CreationTime,
				});
				formIdMap[f.Id] = inserted.Id;
			}

			await _formFieldRepository.InsertManyAsync(model.FormFields
				.Where(x => formIdMap.ContainsKey(x.FormId))
				.Select(x => new FormField
				{
					Title = x.Title,
					Code = x.Code,
					Type = x.Type,
					Config = x.Config,
					Options = x.Options,
					DisplayOrder = x.DisplayOrder,
					FormId = formIdMap[x.FormId],
					CreationTime = x.CreationTime,
				}));

			var pageIdMap = new Dictionary<Guid, Guid>();
			foreach (var p in model.Pages)
			{
				var inserted = await _pageRepository.InsertAsync(new Page
				{
					Title = p.Title,
					Slug = p.Slug,
					Description = p.Description,
					IsActive = p.IsActive,
					PrimaryColor = p.PrimaryColor,
					BrandName = p.BrandName,
					CreationTime = p.CreationTime,
				});
				pageIdMap[p.Id] = inserted.Id;
			}

			await _pageSectionRepository.InsertManyAsync(model.PageSections
				.Where(s => pageIdMap.ContainsKey(s.PageId))
				.Select(s => new PageSection
				{
					Title = s.Title,
					Description = s.Description,
					SectionType = s.SectionType,
					FormId = s.FormId.HasValue && formIdMap.TryGetValue(s.FormId.Value, out var mappedFormId) ? mappedFormId : null,
					Content = s.Content,
					PageId = pageIdMap[s.PageId],
					DisplayOrder = s.DisplayOrder,
					IsActive = s.IsActive,
					StartDate = s.StartDate,
					EndDate = s.EndDate,
					CreationTime = s.CreationTime,
				}));

			await _formRecordRepository.InsertManyAsync(model.FormRecords
				.Where(r => formIdMap.ContainsKey(r.FormId))
				.Select(r => new FormRecord
				{
					Title = r.Title,
					Data = r.Data,
					FormId = formIdMap[r.FormId],
					FormSnapshot = r.FormSnapshot,
					ApprovalStatus = r.ApprovalStatus,
					ApprovalNote = r.ApprovalNote,
					ApprovedAt = r.ApprovedAt,
					CreationTime = r.CreationTime,
				}));

			_logger.LogInformation(
				"Đã nạp dữ liệu khởi tạo từ {FilePath}: {Categories} danh mục, {Forms} biểu mẫu, {Fields} field, {Pages} trang, {Sections} khu vực hiển thị, {Records} kết quả nộp.",
				filePath, model.FormCategories.Count, model.Forms.Count, model.FormFields.Count,
				model.Pages.Count, model.PageSections.Count, model.FormRecords.Count);
		}
	}
}
