using EForm.IFormServices;
using MS.EForm.Enums;
using MS.EForm.FormModels.FormFields;
using MS.EForm.FormModels.Forms;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Modularity;
using Xunit;

namespace MS.EForm.FormServices;

public abstract class FormServiceTests<TStartupModule> : EFormApplicationTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly IFormService _formService;
    private readonly IFormField _formField;

    protected FormServiceTests()
    {
        _formService = GetRequiredService<IFormService>();
        _formField = GetRequiredService<IFormField>();
    }

    [Fact]
    public async Task Should_Create_Form_Successfully()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var result = await _formService.CreateAsync(new CreateUpdateForm
            {
                Title = $"Form {Guid.NewGuid()}",
                Content = "<p>nội dung</p>",
                Description = "mô tả"
            });

            result.Status.ShouldBeTrue();
        });
    }

    [Fact]
    public async Task Should_Create_Form_With_FormFields()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var title = $"Form {Guid.NewGuid()}";
            await _formService.CreateAsync(new CreateUpdateForm
            {
                Title = title,
                FormFields = new List<CreateUpdateFormField>
                {
                    new CreateUpdateFormField
                    {
                        Title = "Họ tên",
                        Code = $"HT{Guid.NewGuid():N}".Substring(0, 10),
                        Type = TypeField.Text,
                        Config = "{\"required\":true}"
                    }
                }
            });
            await FlushChangesAsync();

            var paged = await _formService.GetListAsync(new FormPagingFilterDto { Title = title, PageIndex = 1, PageSize = 10 });
            var created = paged.Items.ShouldHaveSingleItem();

            var fields = await _formField.GetFieldByFormId(created.Id);
            fields.ShouldHaveSingleItem();
        });
    }

    [Fact]
    public async Task Should_Not_Create_Form_With_Duplicate_Title()
    {
        var title = $"Duplicate {Guid.NewGuid()}";

        await WithUnitOfWorkAsync(async () =>
        {
            await _formService.CreateAsync(new CreateUpdateForm { Title = title });
        });

        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formService.CreateAsync(new CreateUpdateForm { Title = title });
        }));
    }

    [Fact]
    public async Task Should_Not_Create_Form_With_NonExisting_Category()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formService.CreateAsync(new CreateUpdateForm
            {
                Title = $"Form {Guid.NewGuid()}",
                CategoryId = Guid.NewGuid()
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Update_NonExisting_Form()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formService.UpdateAsync(Guid.NewGuid(), new CreateUpdateForm { Title = $"Form {Guid.NewGuid()}" });
        }));
    }

    [Fact]
    public async Task Should_Not_Delete_NonExisting_Form()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formService.DeleteAsync(Guid.NewGuid());
        }));
    }
}
