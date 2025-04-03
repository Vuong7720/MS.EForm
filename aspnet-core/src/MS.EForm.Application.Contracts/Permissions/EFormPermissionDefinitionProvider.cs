using MS.EForm.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace MS.EForm.Permissions;

public class EFormPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(EFormPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(EFormPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<EFormResource>(name);
    }
}
