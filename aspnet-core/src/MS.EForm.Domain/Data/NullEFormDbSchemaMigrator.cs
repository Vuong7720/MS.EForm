using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace MS.EForm.Data;

/* This is used if database provider does't define
 * IEFormDbSchemaMigrator implementation.
 */
public class NullEFormDbSchemaMigrator : IEFormDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
