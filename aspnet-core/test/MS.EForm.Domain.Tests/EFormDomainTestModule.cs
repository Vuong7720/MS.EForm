using Volo.Abp.Modularity;

namespace MS.EForm;

[DependsOn(
    typeof(EFormDomainModule),
    typeof(EFormTestBaseModule)
)]
public class EFormDomainTestModule : AbpModule
{

}
