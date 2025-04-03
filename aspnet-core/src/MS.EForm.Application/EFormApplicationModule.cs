using EForm.FormServices;
using EForm.IFormServices;
using Microsoft.Extensions.DependencyInjection;
using MS.EForm.FormServices;
using Volo.Abp.Account;
using Volo.Abp.AutoMapper;
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
    typeof(AbpSettingManagementApplicationModule)
    )]
public class EFormApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
		var services = context.Services;
		Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<EFormApplicationModule>();

        });
		services.AddTransient<IFormCategory, FormCategoryService>();
		services.AddTransient<IFormField, FormFieldServices>();
		services.AddTransient<IFormService, FormService>();
	}
}
