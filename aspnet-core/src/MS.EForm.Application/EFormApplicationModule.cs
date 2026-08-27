using System;
using System.IO;
using EForm.FormServices;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MS.EForm.FormServices;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.AutoMapper;
using Volo.Abp.BlobStoring;
using Volo.Abp.BlobStoring.FileSystem;
using Volo.Abp.DependencyInjection;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.TenantManagement;

namespace MS.EForm;

[DependsOn(
    typeof(EFormDomainModule),
    typeof(AbpAccountApplicationModule),
    typeof(EFormApplicationContractsModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpPermissionManagementApplicationModule),
    typeof(AbpTenantManagementApplicationModule),
    typeof(AbpFeatureManagementApplicationModule),
    typeof(AbpSettingManagementApplicationModule),
    typeof(AbpBlobStoringModule),
    typeof(AbpBlobStoringFileSystemModule)
    )]
public class EFormApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
		var services = context.Services;
		var configuration = context.Services.GetConfiguration();
		Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<EFormApplicationModule>();

        });
		services.AddTransient<IFormCategory, FormCategoryService>();
		services.AddTransient<IFormField, FormFieldServices>();
		services.AddTransient<IFormService, FormService>();
		services.AddTransient<IFormRecord, FormRecordService>();
		services.AddHttpClient(); // dùng cho TurnstileCaptchaVerifier gọi API xác thực captcha

		ConfigureFormAttachmentStorage(context, configuration);
	}

	// Lưu file đính kèm (field kiểu Upload file/ảnh) trên đĩa, không cần bảng DB riêng.
	// Đường dẫn có thể override qua appsettings "FormAttachments:BasePath".
	private void ConfigureFormAttachmentStorage(ServiceConfigurationContext context, IConfiguration configuration)
	{
		Configure<AbpBlobStoringOptions>(options =>
		{
			options.Containers.Configure<FormAttachmentContainer>(container =>
			{
				container.UseFileSystem(fileSystem =>
				{
					var basePath = configuration["FormAttachments:BasePath"];
					if (string.IsNullOrWhiteSpace(basePath))
					{
						// IHostEnvironment chỉ có khi chạy trong 1 ASP.NET Core host thật (AuthServer/HttpApi.Host);
						// không có trong test host, nên fallback về AppContext.BaseDirectory để không throw khi test.
						var hostEnvironment = context.Services.GetSingletonInstanceOrNull<IHostEnvironment>();
						var rootPath = hostEnvironment?.ContentRootPath ?? AppContext.BaseDirectory;
						basePath = Path.Combine(rootPath, "App_Data", "form-attachments");
					}
					fileSystem.BasePath = basePath;
				});
			});
		});
	}
}

// Container rỗng đánh dấu nơi lưu file đính kèm của FormRecord (theo quy ước Volo.Abp.BlobStoring).
public class FormAttachmentContainer
{
}
