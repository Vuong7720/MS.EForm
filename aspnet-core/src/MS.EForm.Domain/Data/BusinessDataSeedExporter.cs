using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using EForm.Entities;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace MS.EForm.Data
{
	// Đọc toàn bộ dữ liệu nghiệp vụ hiện có (Danh mục, Biểu mẫu/Mẫu có sẵn, Field, Trang giới thiệu, Khu
	// vực hiển thị, Kết quả nộp) và ghi ra file JSON tại seed-data/business-data-seed.json (trong thư mục
	// MS.EForm.DbMigrator). Mục đích: mang dữ liệu hiện tại của máy này sang máy khác - commit file JSON
	// này vào git, ở máy mới BusinessDataSeedContributor sẽ tự đọc lại và nạp vào DB rỗng khi chạy
	// DbMigrator như bình thường, không cần thao tác SQL thủ công.
	// Kích hoạt bằng: dotnet run -- --ExportSeedData=true (xem DbMigratorHostedService).
	public class BusinessDataSeedExporter : ITransientDependency
	{
		private readonly IRepository<FormCategories, Guid> _categoryRepository;
		private readonly IRepository<Form, Guid> _formRepository;
		private readonly IRepository<FormField, Guid> _formFieldRepository;
		private readonly IRepository<Page, Guid> _pageRepository;
		private readonly IRepository<PageSection, Guid> _pageSectionRepository;
		private readonly IRepository<FormRecord, Guid> _formRecordRepository;

		public BusinessDataSeedExporter(
			IRepository<FormCategories, Guid> categoryRepository,
			IRepository<Form, Guid> formRepository,
			IRepository<FormField, Guid> formFieldRepository,
			IRepository<Page, Guid> pageRepository,
			IRepository<PageSection, Guid> pageSectionRepository,
			IRepository<FormRecord, Guid> formRecordRepository)
		{
			_categoryRepository = categoryRepository;
			_formRepository = formRepository;
			_formFieldRepository = formFieldRepository;
			_pageRepository = pageRepository;
			_pageSectionRepository = pageSectionRepository;
			_formRecordRepository = formRecordRepository;
		}

		public async Task<(string FilePath, BusinessDataSeedModel Model)> ExportAsync()
		{
			var model = new BusinessDataSeedModel
			{
				FormCategories = (await _categoryRepository.GetListAsync())
					.Select(c => new FormCategorySeedItem
					{
						Id = c.Id,
						Title = c.Title,
						Description = c.Description,
						Index = c.Index,
						CreationTime = c.CreationTime,
					}).ToList(),

				Forms = (await _formRepository.GetListAsync())
					.Select(f => new FormSeedItem
					{
						Id = f.Id,
						Title = f.Title,
						Content = f.Content,
						Description = f.Description,
						CategoryId = f.CategoryId,
						IsTemplate = f.IsTemplate,
						SourceTemplateId = f.SourceTemplateId,
						RequireApproval = f.RequireApproval,
						NotifyOnSubmit = f.NotifyOnSubmit,
						CreationTime = f.CreationTime,
					}).ToList(),

				FormFields = (await _formFieldRepository.GetListAsync())
					.Select(x => new FormFieldSeedItem
					{
						Id = x.Id,
						Title = x.Title,
						Code = x.Code,
						Type = x.Type,
						Config = x.Config,
						Options = x.Options,
						DisplayOrder = x.DisplayOrder,
						FormId = x.FormId,
						CreationTime = x.CreationTime,
					}).ToList(),

				Pages = (await _pageRepository.GetListAsync())
					.Select(p => new PageSeedItem
					{
						Id = p.Id,
						Title = p.Title,
						Slug = p.Slug,
						Description = p.Description,
						IsActive = p.IsActive,
						PrimaryColor = p.PrimaryColor,
						BrandName = p.BrandName,
						CreationTime = p.CreationTime,
					}).ToList(),

				PageSections = (await _pageSectionRepository.GetListAsync())
					.Select(s => new PageSectionSeedItem
					{
						Id = s.Id,
						Title = s.Title,
						Description = s.Description,
						SectionType = s.SectionType,
						FormId = s.FormId,
						Content = s.Content,
						PageId = s.PageId,
						DisplayOrder = s.DisplayOrder,
						IsActive = s.IsActive,
						StartDate = s.StartDate,
						EndDate = s.EndDate,
						CreationTime = s.CreationTime,
					}).ToList(),

				FormRecords = (await _formRecordRepository.GetListAsync())
					.Select(r => new FormRecordSeedItem
					{
						Id = r.Id,
						Title = r.Title,
						Data = r.Data,
						FormId = r.FormId,
						FormSnapshot = r.FormSnapshot,
						ApprovalStatus = r.ApprovalStatus,
						ApprovalNote = r.ApprovalNote,
						ApprovedAt = r.ApprovedAt,
						CreationTime = r.CreationTime,
					}).ToList(),
			};

			var json = JsonSerializer.Serialize(model, new JsonSerializerOptions
			{
				WriteIndented = true,
				// giữ nguyên tiếng Việt có dấu và HTML (Content chứa nhiều dấu <, ", ...) thay vì escape
				// thành \uXXXX - file dễ đọc/diff bằng mắt hơn khi cần kiểm tra lại trước khi commit
				Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
			});

			var filePath = BusinessDataSeedPaths.SeedFilePath;
			Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
			await File.WriteAllTextAsync(filePath, json, new UTF8Encoding(false));

			return (filePath, model);
		}
	}
}
