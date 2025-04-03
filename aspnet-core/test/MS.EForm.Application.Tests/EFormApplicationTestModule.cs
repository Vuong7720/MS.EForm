using Volo.Abp.Modularity;

namespace MS.EForm;

[DependsOn(
    typeof(EFormApplicationModule),
    typeof(EFormDomainTestModule)
)]
public class EFormApplicationTestModule : AbpModule
{

}
