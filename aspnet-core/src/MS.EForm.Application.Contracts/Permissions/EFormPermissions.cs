namespace MS.EForm.Permissions;

public static class EFormPermissions
{
    public const string GroupName = "EForm";

    public static class Forms
    {
        public const string Default = GroupName + ".Forms";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class FormCategories
    {
        public const string Default = GroupName + ".FormCategories";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class FormFields
    {
        public const string Default = GroupName + ".FormFields";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class FormRecords
    {
        public const string Default = GroupName + ".FormRecords";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Approve = Default + ".Approve";
        // không có Create: nộp form (submit-form-record) cố tình để public, không yêu cầu quyền
    }

    public static class PageSections
    {
        public const string Default = GroupName + ".PageSections";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        // không có quyền riêng cho GetShowcasePage: trang showcase công khai, không yêu cầu quyền
    }

    public static class Pages
    {
        public const string Default = GroupName + ".Pages";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
}
