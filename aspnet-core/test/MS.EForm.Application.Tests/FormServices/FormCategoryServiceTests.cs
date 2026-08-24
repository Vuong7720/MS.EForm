using EForm.IFormServices;
using MS.EForm.FormModels.FormCategories;
using Shouldly;
using System;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Modularity;
using Xunit;

namespace MS.EForm.FormServices;

// Các service này không kế thừa ApplicationService nên không có Unit of Work tự động
// ngoài 1 request HTTP thật - phải wrap từng test trong WithUnitOfWorkAsync (như SampleRepositoryTests).
public abstract class FormCategoryServiceTests<TStartupModule> : EFormApplicationTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly IFormCategory _formCategory;

    protected FormCategoryServiceTests()
    {
        _formCategory = GetRequiredService<IFormCategory>();
    }

    [Fact]
    public async Task Should_Create_FormCategory_Successfully()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var result = await _formCategory.CreateFormCategory(new CreateUpdateFormCateDto
            {
                Title = $"Category {Guid.NewGuid()}",
                Description = "Danh mục test",
                Index = 1
            });

            result.Status.ShouldBeTrue();
        });
    }

    [Fact]
    public async Task Should_Not_Create_FormCategory_With_Duplicate_Title()
    {
        var title = $"Duplicate {Guid.NewGuid()}";

        await WithUnitOfWorkAsync(async () =>
        {
            await _formCategory.CreateFormCategory(new CreateUpdateFormCateDto { Title = title, Index = 1 });
        });

        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formCategory.CreateFormCategory(new CreateUpdateFormCateDto { Title = title, Index = 2 });
        }));
    }

    [Fact]
    public async Task Should_Not_Update_NonExisting_FormCategory()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formCategory.UpdateFormCategory(Guid.NewGuid(), new CreateUpdateFormCateDto
            {
                Title = $"Category {Guid.NewGuid()}",
                Index = 1
            });
        }));
    }

    [Fact]
    public async Task Should_Not_Delete_NonExisting_FormCategory()
    {
        await Should.ThrowAsync<UserFriendlyException>(() => WithUnitOfWorkAsync(async () =>
        {
            await _formCategory.DeleteFormCategory(Guid.NewGuid());
        }));
    }

    [Fact]
    public async Task Should_Delete_FormCategory_Successfully()
    {
        await WithUnitOfWorkAsync(async () =>
        {
            var title = $"Category {Guid.NewGuid()}";
            var create = await _formCategory.CreateFormCategory(new CreateUpdateFormCateDto { Title = title, Index = 1 });
            create.Status.ShouldBeTrue();
            await FlushChangesAsync();

            // lọc theo title (unique nhờ Guid) để tìm đúng bản ghi vừa tạo, không phụ thuộc dữ liệu test khác
            var paged = await _formCategory.GetAllFormCatePagedAsync(new CatePagingDto { Title = title, PageIndex = 1, PageSize = 10 });
            var created = paged.Items.ShouldHaveSingleItem();

            var deleteResult = await _formCategory.DeleteFormCategory(created.Id);
            deleteResult.Status.ShouldBeTrue();
        });
    }
}
