using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MS.EForm.Migrations
{
    /// <inheritdoc />
    public partial class Add_Page_And_PageSection_PageId : Migration
    {
        // Id cố định của "trang giới thiệu mặc định" - gán cho các PageSection đã tồn tại từ trước khi có
        // khái niệm Page, để không bị mất liên kết khi thêm cột PageId bắt buộc (NOT NULL)
        private static readonly Guid DefaultPageId = new Guid("a0000000-0000-0000-0000-000000000001");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Pages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pages", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Pages",
                columns: new[] { "Id", "Title", "Slug", "Description", "IsActive", "ExtraProperties", "ConcurrencyStamp", "CreationTime", "IsDeleted" },
                values: new object[] { DefaultPageId, "Trang giới thiệu", "demo", null, true, "{}", Guid.NewGuid().ToString("N"), DateTime.UtcNow, false });

            migrationBuilder.AddColumn<Guid>(
                name: "PageId",
                table: "PageSections",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultPageId);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pages");

            migrationBuilder.DropColumn(
                name: "PageId",
                table: "PageSections");
        }
    }
}
