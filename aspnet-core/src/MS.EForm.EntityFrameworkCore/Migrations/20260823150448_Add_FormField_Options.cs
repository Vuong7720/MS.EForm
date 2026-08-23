using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MS.EForm.Migrations
{
    /// <inheritdoc />
    public partial class Add_FormField_Options : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Options",
                table: "FormFields",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Options",
                table: "FormFields");
        }
    }
}
