using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MS.EForm.Migrations
{
    /// <inheritdoc />
    public partial class Add_PageSection_ContentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "FormId",
                table: "PageSections",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "PageSections",
                type: "nvarchar(max)",
                nullable: true);

            // defaultValue = 1 (PageSectionType.Form) - toàn bộ section đã tồn tại trước tính năng này
            // đều là section nhúng form (0 không khớp giá trị enum nào, sẽ để dữ liệu cũ ở trạng thái
            // không xác định nếu dùng làm mặc định)
            migrationBuilder.AddColumn<int>(
                name: "SectionType",
                table: "PageSections",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "PageSections");

            migrationBuilder.DropColumn(
                name: "SectionType",
                table: "PageSections");

            migrationBuilder.AlterColumn<Guid>(
                name: "FormId",
                table: "PageSections",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
