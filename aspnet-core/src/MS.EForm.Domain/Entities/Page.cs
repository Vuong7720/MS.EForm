using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	// 1 "trang giới thiệu" độc lập (landing page) - chứa nhiều PageSection theo thứ tự riêng.
	// Trước đây chỉ có 1 trang showcase duy nhất (không có khái niệm Page); giờ tách ra để admin có
	// thể dựng nhiều trang giới thiệu khác nhau cho từng mục đích, mỗi trang truy cập qua Slug riêng.
	public class Page : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		// định danh trong URL (/showcase/{slug}) - phải duy nhất, chỉ gồm chữ thường/số/gạch ngang
		public string Slug { get; set; }
		public string? Description { get; set; }
		public bool IsActive { get; set; }
		// tùy biến giao diện trang - phục vụ demo/chào hàng theo đúng màu thương hiệu của từng khách hàng
		public string? PrimaryColor { get; set; }
		// tên/nhãn hiệu hiện ở góc trên trang (thay cho chữ "EForm" mặc định) - vd tên công ty khách hàng
		public string? BrandName { get; set; }
	}
}
