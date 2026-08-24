using EForm.IFormServices;
using MS.EForm.FormModels.FormFields;
using MS.EForm.FormModels.Forms;
using MS.EForm.Enums;
using Shouldly;
using System;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Modularity;
using Xunit;

namespace MS.EForm.FormServices;

public abstract class FormFieldServicesTests<TStartupModule> : EFormApplicationTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly IFormField _formField;
    private readonly IFormService _formService;

    protected FormFieldServicesTests()
    {
        _formField = GetRequiredService<IFormField>();
        _formService = GetRequiredService<IFormService>();
    }

    private async Task<Guid> CreateTestFormAsync()
    {
        var title = $"Form {Guid.NewGuid()}";
        await _formService.CreateAsync(new CreateUpdateForm { Title = title });
        await FlushChangesAsync();
        var paged = await _formService.GetListAsync(new FormPagingFilterDto { Title = title, PageIndex = 1, PageSize = 10 });
        return paged.Items.ShouldHaveSingleItem().Id;
    }

    [Fact]
    public async Task Should_Create_FormField_Successfully()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateTestFormAsync();

            var result = await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = $"Field {Guid.NewGuid()}",
                Code = $"F{Guid.NewGuid():N}".Substring(0, 10),
                Type = TypeField.Text,
                Config = "{\"required\":true}",
                FormId = formId
            });

            result.Status.ShouldBeTrue();
        });
    }

    [Fact]
    public async Task Should_Not_Create_FormField_Without_FormId()
    {
        // regression test: trước đây thiếu FormId sẽ làm crash (NullReferenceException) thay vì báo lỗi rõ ràng
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = $"Field {Guid.NewGuid()}",
                Code = $"F{Guid.NewGuid():N}".Substring(0, 10),
                Type = TypeField.Text,
                FormId = null
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Create_FormField_With_NonExisting_Form()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = $"Field {Guid.NewGuid()}",
                Code = $"F{Guid.NewGuid():N}".Substring(0, 10),
                Type = TypeField.Text,
                FormId = Guid.NewGuid()
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Create_FormField_With_Duplicate_Code()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateTestFormAsync();
            var code = $"F{Guid.NewGuid():N}".Substring(0, 10);

            await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = $"Field {Guid.NewGuid()}",
                Code = code,
                Type = TypeField.Text,
                FormId = formId
            });
            await FlushChangesAsync();

            await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = $"Field {Guid.NewGuid()}",
                Code = code,
                Type = TypeField.Text,
                FormId = formId
            });
        }));
    }

    [Fact]
    public async Task Should_Allow_Same_Title_And_Code_In_Different_Forms()
    {
        // regression test: trước đây check trùng title/code là global thay vì theo từng form,
        // khiến 2 form khác nhau không thể cùng có field ví dụ "Email"/"email"
        await WithUnitOfWorkAsync(async () =>
        {
            var formId1 = await CreateTestFormAsync();
            var formId2 = await CreateTestFormAsync();
            var title = $"Email {Guid.NewGuid()}";
            var code = $"F{Guid.NewGuid():N}".Substring(0, 10);

            var result1 = await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = title,
                Code = code,
                Type = TypeField.Text,
                FormId = formId1
            });
            await FlushChangesAsync();

            var result2 = await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = title,
                Code = code,
                Type = TypeField.Text,
                FormId = formId2
            });

            result1.Status.ShouldBeTrue();
            result2.Status.ShouldBeTrue();
        });
    }

    [Fact]
    public async Task Should_Persist_Options_And_DisplayOrder()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateTestFormAsync();
            var code = $"F{Guid.NewGuid():N}".Substring(0, 10);

            await _formField.CreateFormField(new CreateUpdateFormField
            {
                Title = $"Field {Guid.NewGuid()}",
                Code = code,
                Type = TypeField.Select,
                Options = "[\"Có\",\"Không\"]",
                DisplayOrder = 3,
                FormId = formId
            });
            await FlushChangesAsync();

            var fields = await _formField.GetFieldByFormId(formId);
            var created = fields.ShouldHaveSingleItem();
            created.Options.ShouldBe("[\"Có\",\"Không\"]");
            created.DisplayOrder.ShouldBe(3);
        });
    }
}
