using System;
using System.Collections.Generic;
using MS.EForm.Enums;

namespace MS.EForm.Data
{
	// Cấu trúc file JSON export/import dữ liệu nghiệp vụ (Danh mục, Biểu mẫu/Mẫu có sẵn, Field, Trang
	// giới thiệu, Khu vực hiển thị, Kết quả nộp) - dùng chung giữa BusinessDataSeedExporter (ghi ra file)
	// và BusinessDataSeedContributor (đọc lại khi DbMigrator chạy trên máy khác). Không copy các cột audit
	// tham chiếu người dùng (CreatorId, LastModifierId, ApprovedByUserId...) vì Id user khác nhau giữa các
	// máy/DB - chỉ giữ CreationTime để dữ liệu seed trông "tự nhiên" hơn khi xem lại.
	public class BusinessDataSeedModel
	{
		public List<FormCategorySeedItem> FormCategories { get; set; } = new();
		public List<FormSeedItem> Forms { get; set; } = new();
		public List<FormFieldSeedItem> FormFields { get; set; } = new();
		public List<PageSeedItem> Pages { get; set; } = new();
		public List<PageSectionSeedItem> PageSections { get; set; } = new();
		public List<FormRecordSeedItem> FormRecords { get; set; } = new();
	}

	public class FormCategorySeedItem
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public string? Description { get; set; }
		public int Index { get; set; }
		public DateTime CreationTime { get; set; }
	}

	public class FormSeedItem
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public string? Content { get; set; }
		public string? Description { get; set; }
		public Guid? CategoryId { get; set; }
		public bool IsTemplate { get; set; }
		public Guid? SourceTemplateId { get; set; }
		public bool RequireApproval { get; set; }
		public bool NotifyOnSubmit { get; set; }
		public DateTime CreationTime { get; set; }
	}

	public class FormFieldSeedItem
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public string Code { get; set; }
		public TypeField Type { get; set; }
		public string? Config { get; set; }
		public string? Options { get; set; }
		public int DisplayOrder { get; set; }
		public Guid FormId { get; set; }
		public DateTime CreationTime { get; set; }
	}

	public class PageSeedItem
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public string Slug { get; set; }
		public string? Description { get; set; }
		public bool IsActive { get; set; }
		public string? PrimaryColor { get; set; }
		public string? BrandName { get; set; }
		public DateTime CreationTime { get; set; }
	}

	public class PageSectionSeedItem
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public string? Description { get; set; }
		public PageSectionType SectionType { get; set; }
		public Guid? FormId { get; set; }
		public string? Content { get; set; }
		public Guid PageId { get; set; }
		public int DisplayOrder { get; set; }
		public bool IsActive { get; set; }
		public DateTime? StartDate { get; set; }
		public DateTime? EndDate { get; set; }
		public DateTime CreationTime { get; set; }
	}

	public class FormRecordSeedItem
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public string Data { get; set; }
		public Guid FormId { get; set; }
		public string? FormSnapshot { get; set; }
		public ApprovalStatus ApprovalStatus { get; set; }
		public string? ApprovalNote { get; set; }
		public DateTime? ApprovedAt { get; set; }
		public DateTime CreationTime { get; set; }
	}

	// Đường dẫn file seed dùng chung giữa lúc export (máy nguồn) và lúc DbMigrator tự nạp lại (máy đích).
	// Đặt trong thư mục MS.EForm.DbMigrator (thư mục làm việc khi `dotnet run` từ đó) để file này đi theo
	// repo qua git - máy khác chỉ cần clone repo là đã có sẵn, không cần copy tay.
	internal static class BusinessDataSeedPaths
	{
		public static string SeedFilePath => System.IO.Path.Combine(
			System.IO.Directory.GetCurrentDirectory(), "seed-data", "business-data-seed.json");
	}
}
