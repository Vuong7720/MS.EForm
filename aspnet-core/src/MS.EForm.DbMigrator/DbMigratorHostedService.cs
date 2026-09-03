using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MS.EForm.Data;
using Serilog;
using Volo.Abp;
using Volo.Abp.Data;

namespace MS.EForm.DbMigrator;

public class DbMigratorHostedService : IHostedService
{
    private readonly IHostApplicationLifetime _hostApplicationLifetime;
    private readonly IConfiguration _configuration;

    public DbMigratorHostedService(IHostApplicationLifetime hostApplicationLifetime, IConfiguration configuration)
    {
        _hostApplicationLifetime = hostApplicationLifetime;
        _configuration = configuration;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using (var application = await AbpApplicationFactory.CreateAsync<EFormDbMigratorModule>(options =>
        {
           options.Services.ReplaceConfiguration(_configuration);
           options.UseAutofac();
           options.Services.AddLogging(c => c.AddSerilog());
           options.AddDataMigrationEnvironment();
        }))
        {
            await application.InitializeAsync();

            // dotnet run -- --ExportSeedData=true : xuất toàn bộ dữ liệu nghiệp vụ hiện có ra file
            // seed-data/business-data-seed.json thay vì migrate/seed như bình thường - dùng khi cần mang
            // dữ liệu hiện tại sang máy khác (xem BusinessDataSeedExporter/BusinessDataSeedContributor).
            if (string.Equals(_configuration["ExportSeedData"], "true", StringComparison.OrdinalIgnoreCase))
            {
                var (filePath, model) = await application
                    .ServiceProvider
                    .GetRequiredService<BusinessDataSeedExporter>()
                    .ExportAsync();

                Log.Information(
                    "Đã export dữ liệu ra {FilePath}: {Categories} danh mục, {Forms} biểu mẫu, {Fields} field, {Pages} trang, {Sections} khu vực hiển thị, {Records} kết quả nộp.",
                    filePath, model.FormCategories.Count, model.Forms.Count, model.FormFields.Count,
                    model.Pages.Count, model.PageSections.Count, model.FormRecords.Count);
            }
            else
            {
                await application
                    .ServiceProvider
                    .GetRequiredService<EFormDbMigrationService>()
                    .MigrateAsync();
            }

            await application.ShutdownAsync();

            _hostApplicationLifetime.StopApplication();
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
