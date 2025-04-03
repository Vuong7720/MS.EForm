using Volo.Abp.Modularity;

namespace MS.EForm;

public abstract class EFormApplicationTestBase<TStartupModule> : EFormTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
