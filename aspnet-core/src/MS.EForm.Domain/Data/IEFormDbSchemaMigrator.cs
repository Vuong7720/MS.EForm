using System.Threading.Tasks;

namespace MS.EForm.Data;

public interface IEFormDbSchemaMigrator
{
    Task MigrateAsync();
}
