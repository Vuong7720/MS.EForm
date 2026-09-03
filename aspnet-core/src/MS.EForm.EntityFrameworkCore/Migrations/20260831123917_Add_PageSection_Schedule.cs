using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MS.EForm.Migrations
{
    /// <inheritdoc />
    public partial class Add_PageSection_Schedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "PageSections",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "PageSections",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "PageSections");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "PageSections");
        }
    }
}
