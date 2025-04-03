using Volo.Abp.Modularity;

namespace MS.EForm;

/* Inherit from this class for your domain layer tests. */
public abstract class EFormDomainTestBase<TStartupModule> : EFormTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
