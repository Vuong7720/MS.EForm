using Xunit;

namespace MS.EForm.EntityFrameworkCore;

[CollectionDefinition(EFormTestConsts.CollectionDefinitionName)]
public class EFormEntityFrameworkCoreCollection : ICollectionFixture<EFormEntityFrameworkCoreFixture>
{

}
