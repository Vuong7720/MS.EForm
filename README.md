# EForm

Hệ thống quản lý biểu mẫu điện tử: soạn nội dung như một văn bản hành chính thật sự, chèn field nhập liệu ngay bên trong, và thay đổi toàn bộ nội dung ấy tại runtime — không cần build lại code. Backend ASP.NET Core / ABP Framework (.NET 9), frontend Angular 19.

> Muốn hiểu chức năng, kiến trúc, phân quyền... chi tiết? Xem [docs/HUONG-DAN-SU-DUNG.md](docs/HUONG-DAN-SU-DUNG.md). Muốn deploy lên môi trường free (Azure SQL + Render + Cloudflare)? Xem [docs/DEPLOY_FREE.md](docs/DEPLOY_FREE.md). Tài liệu này (README) chỉ tập trung vào **chạy dự án ở máy local từ đầu**.

## Yêu cầu hệ thống

Cài sẵn trước khi bắt đầu:

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet) | 9.0+ | Chạy backend |
| [Node.js](https://nodejs.org/en) | 20.11+ | Chạy frontend Angular |
| [SQL Server LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb) | — | Đi kèm Visual Studio, hoặc cài riêng qua "SQL Server Express LocalDB". Connection string mặc định trỏ vào `(localdb)\MSSQLLocalDB` |
| Redis (hoặc tương đương) | — | **Bắt buộc** — cả `DbMigrator`, `AuthServer` lẫn `HttpApi.Host` đều cần Redis chạy sẵn để khởi động được (cache/khóa phân tán), kể cả khi chạy local. Xem lựa chọn ở Bước 2 |

## Bước 1 — Clone dự án

```bash
git clone <url-repo-cua-ban> EForm
cd EForm
```

## Bước 2 — Cài & chạy Redis

Chọn 1 trong các cách sau, miễn là có Redis lắng nghe ở `localhost:6379` (mặc định trong `appsettings.json` là `localhost,defaultDatabase=8`):

- **Docker** (đơn giản nhất nếu đã có Docker Desktop):
  ```bash
  docker run -d --name eform-redis -p 6379:6379 redis
  ```
- **Memurai** (bản Redis-compatible chạy native trên Windows, không cần Docker/WSL): tải tại [memurai.com](https://www.memurai.com/), cài xong tự chạy như 1 Windows Service.
- **WSL**: cài Redis trong Ubuntu (WSL) rồi `redis-server`.

Bỏ qua bước này thì `DbMigrator`/`AuthServer`/`HttpApi.Host` sẽ báo lỗi kết nối Redis ngay khi khởi động.

## Bước 3 — Chạy DbMigrator (tạo database + nạp sẵn dữ liệu mẫu)

```bash
cd aspnet-core/src/MS.EForm.DbMigrator
dotnet run
```

Lệnh này tự động:

1. Tạo database `EForm` trên LocalDB và áp dụng toàn bộ migration.
2. Seed role/quyền mặc định + tài khoản admin (xem Bước 7).
3. Seed sẵn vài mẫu văn bản hành chính dựng sẵn (Giấy ủy quyền, Đơn xin nghỉ phép...).
4. **Tự động nạp bộ dữ liệu demo** (`seed-data/business-data-seed.json` — Danh mục, Biểu mẫu, Trang giới thiệu, Khu vực hiển thị, Kết quả nộp mẫu) nếu database đang trống, để bạn có ngay dữ liệu để xem thay vì màn hình trống trơn.

Chạy lại lệnh này an toàn bất kỳ lúc nào (idempotent) — không tạo trùng dữ liệu nếu database đã có sẵn.

> Không thấy dữ liệu demo sau khi chạy? Xem mục [Cập nhật dữ liệu khởi tạo](#cập-nhật-dữ-liệu-khởi-tạo) bên dưới để biết cơ chế seed hoạt động thế nào.

## Bước 4 — Chạy AuthServer

Mở 1 terminal mới:

```bash
cd aspnet-core/src/MS.EForm.AuthServer
dotnet run
```

Chạy ở `https://localhost:44320`. Lần đầu chạy, trình duyệt/terminal có thể hỏi tin tưởng chứng chỉ HTTPS phát triển của .NET — đồng ý là được (chỉ áp dụng cho máy local, không phải bước cấu hình chứng chỉ thật).

## Bước 5 — Chạy HttpApi.Host

Mở 1 terminal khác:

```bash
cd aspnet-core/src/MS.EForm.HttpApi.Host
dotnet run
```

Chạy ở `https://localhost:44383`. Swagger có tại `https://localhost:44383/swagger`.

## Bước 6 — Cài & chạy Angular

Mở 1 terminal khác:

```bash
cd angular
npm install
npm start
```

Mặc định mở sẵn `http://localhost:4200` trong trình duyệt. File `angular/src/environments/environment.ts` đã trỏ sẵn đúng 2 địa chỉ AuthServer/HttpApi.Host ở trên — không cần chỉnh gì thêm cho local.

## Bước 7 — Đăng nhập

Tài khoản quản trị mặc định do ABP Framework seed sẵn:

| Tài khoản | Mật khẩu |
|---|---|
| `admin` | `1q2w3E*` |

> Đây là mật khẩu mặc định của ABP Framework, ai clone dự án cũng seed ra giống nhau — **đổi ngay sau lần đăng nhập đầu tiên** nếu đây không còn là môi trường chỉ dùng riêng cho bạn.

Đăng nhập xong, vào trang chủ sẽ thấy Dashboard đã có sẵn số liệu (nhờ dữ liệu demo ở Bước 3) thay vì toàn số 0. Vào **Xem trang giới thiệu (Demo)** ở menu để xem trang public đã có sẵn 1 vài khu vực hiển thị/form mẫu.

## Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `DbMigrator`/`AuthServer`/`HttpApi.Host` lỗi ngay khi khởi động, nhắc tới Redis/`ConnectionMultiplexer` | Redis chưa chạy | Xem lại Bước 2 |
| Lỗi kết nối SQL Server / không tìm thấy `(localdb)\MSSQLLocalDB` | Chưa cài SQL Server Express LocalDB | Cài qua Visual Studio Installer (workload "Data storage and processing") hoặc cài riêng gói LocalDB |
| Trang Angular hiện lỗi CORS hoặc không đăng nhập được | AuthServer hoặc HttpApi.Host chưa chạy, hoặc chạy sai cổng | Đảm bảo cả 2 đang chạy đúng cổng 44320/44383 như Bước 4-5 |
| Trình duyệt cảnh báo không an toàn khi vào `https://localhost:...` | Chứng chỉ HTTPS phát triển của .NET chưa được tin tưởng | Chạy `dotnet dev-certs https --trust` rồi khởi động lại AuthServer/HttpApi.Host |
| Đăng nhập được nhưng Dashboard/Danh mục/Biểu mẫu đều trống | Database đã tồn tại từ trước lúc thêm cơ chế seed dữ liệu demo (nên bị bỏ qua vì không còn trống) | Bình thường nếu bạn đã tự tạo dữ liệu riêng trước đó — không phải lỗi. Nếu muốn seed lại từ đầu, xóa database `EForm` trên LocalDB rồi chạy lại Bước 3 |

## Cấu trúc dự án

```
aspnet-core/
  src/
    MS.EForm.Domain(.Shared)         Entity & enum cốt lõi
    MS.EForm.Application(.Contracts) Business logic, DTO, permission
    MS.EForm.EntityFrameworkCore     Data access (EF Core, SQL Server)
    MS.EForm.HttpApi(.Client)        REST API
    MS.EForm.HttpApi.Host            Host chạy API
    MS.EForm.AuthServer              OAuth/OpenIddict server
    MS.EForm.DbMigrator              Console app: migrate + seed dữ liệu
angular/                             Frontend Angular 19
docs/                                Tài liệu dự án (xem bên dưới)
```

## Tài liệu liên quan

- [docs/HUONG-DAN-SU-DUNG.md](docs/HUONG-DAN-SU-DUNG.md) — bối cảnh dự án, kiến trúc chi tiết, phân quyền, hướng dẫn dùng từng chức năng (xây dựng biểu mẫu, các kiểu field, trang giới thiệu...).
- [docs/DEPLOY_FREE.md](docs/DEPLOY_FREE.md) — hướng dẫn deploy bản demo lên nền tảng miễn phí (Azure SQL + Render + Cloudflare Pages).

## Cập nhật dữ liệu khởi tạo

Bộ dữ liệu demo tự nạp ở Bước 3 nằm ở `aspnet-core/src/MS.EForm.DbMigrator/seed-data/business-data-seed.json`, do `BusinessDataSeedContributor` tự đọc và nạp vào database rỗng mỗi khi `DbMigrator` chạy (bỏ qua nếu database đã có dữ liệu, hoặc nếu `ASPNETCORE_ENVIRONMENT=Production` — tránh vô tình nạp dữ liệu demo lên bản deploy thật).

Muốn cập nhật file này theo dữ liệu hiện tại trên máy bạn (VD sau khi thêm/sửa vài biểu mẫu mẫu và muốn người khác clone về cũng có đúng bộ dữ liệu mới đó):

```bash
cd aspnet-core/src/MS.EForm.DbMigrator
dotnet run -- --ExportSeedData=true
```

Lệnh này ghi đè lại file JSON ở trên từ dữ liệu thật đang có trong database local của bạn (Danh mục, Biểu mẫu/Mẫu có sẵn, Field, Trang giới thiệu, Khu vực hiển thị, Kết quả nộp) — commit lại file này vào git để máy khác clone về có luôn bộ dữ liệu mới.

> File đính kèm (ảnh/file upload trong "Kết quả nộp form") nằm trên ổ đĩa (`App_Data/form-attachments`), không nằm trong database nên lệnh trên không mang theo được — cần tự chép tay thư mục đó nếu muốn giữ nguyên file đính kèm khi chuyển máy.
