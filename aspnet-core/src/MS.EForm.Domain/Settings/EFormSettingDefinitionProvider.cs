using Volo.Abp.Settings;

namespace MS.EForm.Settings;

public class EFormSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(EFormSettings.MySetting1));
    }
}
