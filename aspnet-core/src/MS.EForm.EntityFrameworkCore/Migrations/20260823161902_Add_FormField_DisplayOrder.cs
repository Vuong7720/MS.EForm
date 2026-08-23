using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MS.EForm.Migrations
{
    /// <inheritdoc />
    public partial class Add_FormField_DisplayOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "FormFields",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "FormFields");
        }
    }
}
