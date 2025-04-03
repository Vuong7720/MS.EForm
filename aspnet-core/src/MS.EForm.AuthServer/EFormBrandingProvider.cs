using Microsoft.Extensions.Localization;
using MS.EForm.Localization;
using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;

namespace MS.EForm;

[Dependency(ReplaceServices = true)]
public class EFormBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<EFormResource> _localizer;

    public EFormBrandingProvider(IStringLocalizer<EFormResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
