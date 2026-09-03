using Microsoft.Extensions.DependencyInjection;
using MS.EForm.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Caching;
using Volo.Abp.Modularity;

namespace MS.EForm.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(EFormEntityFrameworkCoreModule),
    typeof(EFormApplicationContractsModule)
    )]
public class EFormDbMigratorModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddDistributedMemoryCache();
        Configure<AbpDistributedCacheOptions>(options => { options.KeyPrefix = "EForm:"; });
    }
}
