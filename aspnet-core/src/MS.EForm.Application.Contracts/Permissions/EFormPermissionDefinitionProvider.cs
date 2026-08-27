using MS.EForm.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace MS.EForm.Permissions;

public class EFormPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(EFormPermissions.GroupName, L("Permission:EForm"));

        var forms = myGroup.AddPermission(EFormPermissions.Forms.Default, L("Permission:Forms"));
        forms.AddChild(EFormPermissions.Forms.Create, L("Permission:Create"));
        forms.AddChild(EFormPermissions.Forms.Edit, L("Permission:Edit"));
        forms.AddChild(EFormPermissions.Forms.Delete, L("Permission:Delete"));

        var formCategories = myGroup.AddPermission(EFormPermissions.FormCategories.Default, L("Permission:FormCategories"));
        formCategories.AddChild(EFormPermissions.FormCategories.Create, L("Permission:Create"));
        formCategories.AddChild(EFormPermissions.FormCategories.Edit, L("Permission:Edit"));
        formCategories.AddChild(EFormPermissions.FormCategories.Delete, L("Permission:Delete"));

        var formFields = myGroup.AddPermission(EFormPermissions.FormFields.Default, L("Permission:FormFields"));
        formFields.AddChild(EFormPermissions.FormFields.Create, L("Permission:Create"));
        formFields.AddChild(EFormPermissions.FormFields.Edit, L("Permission:Edit"));
        formFields.AddChild(EFormPermissions.FormFields.Delete, L("Permission:Delete"));

        var formRecords = myGroup.AddPermission(EFormPermissions.FormRecords.Default, L("Permission:FormRecords"));
        formRecords.AddChild(EFormPermissions.FormRecords.Edit, L("Permission:Edit"));
        formRecords.AddChild(EFormPermissions.FormRecords.Delete, L("Permission:Delete"));
        formRecords.AddChild(EFormPermissions.FormRecords.Approve, L("Permission:Approve"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<EFormResource>(name);
    }
}
