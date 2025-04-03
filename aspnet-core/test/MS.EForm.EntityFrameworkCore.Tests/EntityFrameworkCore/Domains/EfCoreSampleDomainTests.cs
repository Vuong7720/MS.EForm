using MS.EForm.Samples;
using Xunit;

namespace MS.EForm.EntityFrameworkCore.Domains;

[Collection(EFormTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<EFormEntityFrameworkCoreTestModule>
{

}
