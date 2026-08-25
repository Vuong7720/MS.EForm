using EForm.IFormServices;
using MS.EForm.Enums;
using MS.EForm.FormModels.FormFields;
using MS.EForm.FormModels.FormRecords;
using MS.EForm.FormModels.Forms;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Modularity;
using Xunit;

namespace MS.EForm.FormServices;

public abstract class FormRecordServiceTests<TStartupModule> : EFormApplicationTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly IFormRecord _formRecord;
    private readonly IFormService _formService;

    protected FormRecordServiceTests()
    {
        _formRecord = GetRequiredService<IFormRecord>();
        _formService = GetRequiredService<IFormService>();
    }

    private async Task<Guid> CreateFormWithFieldAsync(CreateUpdateFormField field)
    {
        var title = $"Form {Guid.NewGuid()}";
        await _formService.CreateAsync(new CreateUpdateForm
        {
            Title = title,
            FormFields = new List<CreateUpdateFormField> { field }
        });
        await FlushChangesAsync();

        var paged = await _formService.GetListAsync(new FormPagingFilterDto { Title = title, PageIndex = 1, PageSize = 10 });
        return paged.Items.ShouldHaveSingleItem().Id;
    }

    [Fact]
    public async Task Should_Submit_FormRecord_Successfully()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Họ tên",
                Code = "HOTEN",
                Type = TypeField.Text
            });

            var result = await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = formId,
                Data = "{\"HOTEN\":\"Nguyễn Văn A\"}"
            });

            result.Status.ShouldBeTrue();
        });
    }

    [Fact]
    public async Task Should_Not_Submit_When_Required_Field_Missing()
    {
        UserFriendlyException? ex = null;
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Họ tên",
                Code = "HOTEN",
                Type = TypeField.Text,
                Config = "{\"required\":true}"
            });

            ex = await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
                {
                    Title = "Bản ghi test",
                    FormId = formId,
                    Data = "{}"
                });
            });
        });
        ex!.Message.ShouldContain("bắt buộc");
    }

    [Fact]
    public async Task Should_Not_Submit_With_Invalid_Select_Option()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Giới tính",
                Code = "GIOITINH",
                Type = TypeField.Select,
                Options = "[\"Nam\",\"Nữ\"]"
            });

            await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = formId,
                Data = "{\"GIOITINH\":\"Khac\"}"
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Submit_Text_Shorter_Than_MinLength()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Mã số",
                Code = "MASO",
                Type = TypeField.Text,
                Config = "{\"minLength\":5}"
            });

            await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = formId,
                Data = "{\"MASO\":\"ab\"}"
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Submit_Text_Not_Matching_Pattern()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Email",
                Code = "EMAIL",
                Type = TypeField.Text,
                Config = "{\"pattern\":\"^[^@]+@[^@]+\\\\.[^@]+$\"}"
            });

            await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = formId,
                Data = "{\"EMAIL\":\"khong-hop-le\"}"
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Submit_Number_Outside_Range()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Tuổi",
                Code = "TUOI",
                Type = TypeField.Number,
                Config = "{\"min\":18,\"max\":60}"
            });

            await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = formId,
                Data = "{\"TUOI\":\"15\"}"
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Submit_To_NonExisting_Form()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = Guid.NewGuid(),
                Data = "{}"
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Delete_NonExisting_FormRecord()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formRecord.DeleteAsync(Guid.NewGuid());
        }));
    }

    [Fact]
    public async Task Should_Not_Submit_When_Required_File_Field_Missing()
    {
        UserFriendlyException? ex = null;
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Minh chứng",
                Code = "MINHCHUNG",
                Type = TypeField.File,
                Config = "{\"required\":true}"
            });

            ex = await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
                {
                    Title = "Bản ghi test",
                    FormId = formId,
                    Data = "{}"
                });
            });
        });
        ex!.Message.ShouldContain("bắt buộc");
    }

    [Fact]
    public async Task Should_Not_Submit_File_Field_With_Nonexisting_Blob()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Minh chứng",
                Code = "MINHCHUNG",
                Type = TypeField.File
            });

            // blob "khong-ton-tai.pdf" chưa từng được upload -> ValidateData phải chặn lại
            await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
            {
                Title = "Bản ghi test",
                FormId = formId,
                Data = "{\"MINHCHUNG\":\"[{\\\"name\\\":\\\"cv.pdf\\\",\\\"blob\\\":\\\"khong-ton-tai.pdf\\\",\\\"size\\\":100}]\"}"
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Submit_When_Required_Signature_Field_Missing()
    {
        UserFriendlyException? ex = null;
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Chữ ký",
                Code = "CHUKY",
                Type = TypeField.Signature,
                Config = "{\"required\":true}"
            });

            ex = await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
                {
                    Title = "Bản ghi test",
                    FormId = formId,
                    Data = "{}"
                });
            });
        });
        ex!.Message.ShouldContain("bắt buộc");
    }

    [Fact]
    public async Task Should_Not_Submit_When_Required_File_Field_Has_Empty_Attachment_Array()
    {
        // "Data" = "[]" không phải whitespace nên required-check chung ở đầu ValidateData không bắt
        // được - phải có check riêng trong nhánh File/Signature (đã vá cùng lúc thêm field Signature).
        UserFriendlyException? ex = null;
        await WithUnitOfWorkAsync(async () =>
        {
            var formId = await CreateFormWithFieldAsync(new CreateUpdateFormField
            {
                Title = "Minh chứng",
                Code = "MINHCHUNG",
                Type = TypeField.File,
                Config = "{\"required\":true}"
            });

            ex = await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await _formRecord.SubmitAsync(new CreateUpdateFormRecordDto
                {
                    Title = "Bản ghi test",
                    FormId = formId,
                    Data = "{\"MINHCHUNG\":\"[]\"}"
                });
            });
        });
        ex!.Message.ShouldContain("bắt buộc");
    }
}
