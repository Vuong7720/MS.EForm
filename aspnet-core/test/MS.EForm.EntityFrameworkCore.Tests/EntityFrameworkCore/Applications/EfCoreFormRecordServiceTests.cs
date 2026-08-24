using MS.EForm.FormServices;
using Xunit;

namespace MS.EForm.EntityFrameworkCore.Applications;

[Collection(EFormTestConsts.CollectionDefinitionName)]
public class EfCoreFormRecordServiceTests : FormRecordServiceTests<EFormEntityFrameworkCoreTestModule>
{

}
