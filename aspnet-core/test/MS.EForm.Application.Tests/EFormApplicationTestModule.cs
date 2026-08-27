using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MS.EForm.FormServices;
using Volo.Abp.Modularity;

namespace MS.EForm;

[DependsOn(
    typeof(EFormApplicationModule),
    typeof(EFormDomainTestModule)
)]
public class EFormApplicationTestModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // test không có config Captcha (không gọi mạng thật ra Cloudflare) - luôn coi như hợp lệ,
        // để không phá vỡ các test SubmitAsync hiện có vốn không gửi kèm CaptchaToken
        context.Services.Replace(ServiceDescriptor.Transient<ICaptchaVerifier, AlwaysPassCaptchaVerifier>());
    }
}

file class AlwaysPassCaptchaVerifier : ICaptchaVerifier
{
    public Task<bool> VerifyAsync(string? token) => Task.FromResult(true);
}
