# Deploy EForm lên nền tảng miễn phí (Azure SQL + Render + Cloudflare Pages)

> Tài liệu này dành cho việc deploy bản **thử nghiệm/demo**, không phải production thật. Một số đánh đổi (cold-start, không lưu file bền) được chấp nhận có chủ đích để giữ 100% miễn phí.

## 0. Kiến trúc sau khi deploy

| Thành phần              | Nơi chạy                           | Ghi chú                                      |
| ------------------------ | ----------------------------------- | --------------------------------------------- |
| Database (SQL Server)   | Azure SQL Database (free offer)    | 32GB / 100k vCore-giây/tháng free vĩnh viễn  |
| `MS.EForm.AuthServer`   | Render.com Web Service (Docker, free) | OAuth/OpenIddict                          |
| `MS.EForm.HttpApi.Host` | Render.com Web Service (Docker, free) | REST API                                  |
| Angular SPA             | Cloudflare Pages (free)            | Static hosting + CDN                          |
| Cache/Distributed lock  | In-memory / file trong container   | Đã bỏ Redis (xem bên dưới)                   |

Phần code trong repo đã được chuẩn bị sẵn: bỏ Redis (dùng in-memory cache + file-based distributed lock), Data Protection Keys lưu vào chính SQL Database (để không mất session khi container "ngủ" rồi thức dậy), có sẵn Dockerfile cho AuthServer + HttpApi.Host, có `_redirects` cho Angular SPA routing trên Cloudflare Pages.

## ⚠️ Giới hạn cần biết trước (free tier trade-off)

1. **Cold start**: Render free Web Service "ngủ" sau ~15 phút không có request. Request đầu tiên sau khi ngủ sẽ mất thêm ~30-50 giây để container khởi động lại. Đây là bình thường với free tier, không phải lỗi.
2. **File đính kèm KHÔNG bền**: Field kiểu "Upload file/ảnh" của form hiện lưu file thẳng ra ổ đĩa container (`App_Data/form-attachments` trong `MS.EForm.Application/EFormApplicationModule.cs`). Ổ đĩa của Render free Web Service là **ephemeral** — mỗi lần container ngủ/dậy hoặc redeploy, các file đã upload sẽ **mất**. Chấp nhận được cho demo; nếu sau này cần bền, phải đổi sang blob storage ngoài (vd Cloudflare R2 free tier) — chưa làm trong lần này.
3. Cả AuthServer lẫn HttpApi.Host chỉ chạy **1 instance** (free tier không cho scale) — đúng với giả định "bỏ Redis" đã chọn.

## 1. Tạo Azure SQL Database (free offer)

1. Vào `azure.microsoft.com`, đăng ký tài khoản Azure free (cần thẻ tín dụng để xác minh danh tính, nhưng free SQL offer thì không bị trừ tiền nếu ở trong hạn mức).
2. Trong Azure Portal, tạo resource **SQL Database**:
   - Chọn tạo **SQL server** mới cùng lúc (đặt tên, admin login/password — nhớ lại password này).
   - Ở bước **Compute + storage**, chọn **Serverless** tier, và chọn **Apply free offer** khi Azure hỏi (chỉ áp dụng được 1 lần/subscription).
   - Database name: `EForm` (khớp với tên trong connection string mẫu hiện tại).
3. Sau khi tạo xong, vào **Networking** của SQL server:
   - Bật **Allow Azure services and resources to access this server**.
   - Thêm **firewall rule** cho phép **IP hiện tại của máy bạn** (để chạy DbMigrator từ máy local ở bước 5).
   - Vì Render không nằm trong Azure, cần thêm rule mở **0.0.0.0 - 255.255.255.255** (hoặc dải IP Render công bố nếu có) để HttpApi.Host/AuthServer trên Render kết nối được — chấp nhận được cho demo vì kết nối vẫn yêu cầu đúng user/password.
4. Vào **Connection strings** của database, copy chuỗi kiểu ADO.NET, dạng:

   ```text
   Server=tcp:<ten-server>.database.windows.net,1433;Initial Catalog=EForm;Persist Security Info=False;User ID=<user>;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
   ```

   Giữ lại chuỗi này — dùng ở bước 3 và bước 5.

## 2. Tạo chứng chỉ OpenIddict thật (bắt buộc cho AuthServer chạy ở Production)

Code AuthServer (`EFormAuthServerModule.cs`, `PreConfigureServices`) yêu cầu: khi **không phải** môi trường Development, phải có file `openiddict.pfx` để ký/mã hóa token — mật khẩu đã hard-code sẵn trong code là `d3baaaed-0ec6-476e-b633-187e0c563f52`. Không có file này, AuthServer sẽ **crash lúc khởi động** trên Render.

Chạy trong PowerShell (trên máy bạn), tạo 1 chứng chỉ tự ký:

```powershell
$cert = New-SelfSignedCertificate -Subject "CN=EForm OpenIddict Server" `
    -CertStoreLocation "cert:\CurrentUser\My" -KeyExportPolicy Exportable `
    -KeySpec Signature -KeyUsage DigitalSignature -KeyAlgorithm RSA -KeyLength 2048 `
    -NotAfter (Get-Date).AddYears(5)

$pwd = ConvertTo-SecureString -String "d3baaaed-0ec6-476e-b633-187e0c563f52" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath ".\openiddict.pfx" -Password $pwd
Remove-Item -Path "cert:\CurrentUser\My\$($cert.Thumbprint)"
```

Kết quả là file `openiddict.pfx` trong thư mục hiện tại. **Không commit file này vào git** — sẽ upload trực tiếp lên Render làm Secret File ở bước 3.

## 3. Tạo Render.com Web Services

1. Đăng ký tài khoản tại `render.com`, **Connect a repository** trỏ vào GitHub repo của dự án.

### 3a. Service `eform-authserver`

- New → Web Service → chọn repo → **Runtime: Docker**.
- **Dockerfile Path**: `aspnet-core/src/MS.EForm.AuthServer/Dockerfile`
- **Docker Build Context Directory**: `aspnet-core`
- Plan: **Free**.
- Vào tab **Environment → Secret Files**, thêm file mới với Filename `/app/openiddict.pfx` và upload trực tiếp file `openiddict.pfx` vừa tạo (Render hỗ trợ upload file nhị phân cho Secret Files, không chỉ paste text). Nếu giao diện Render lúc bạn dùng không có tùy chọn upload file mà chỉ có ô nhập text, quay lại nhắn cho tôi — sẽ chuyển sang cách base64-encode file rồi giải mã trong entrypoint.
- Vào tab **Environment**, thêm các biến (giá trị `<...>` bạn tự điền):

  | Key                                   | Value                                                                                                            |
  | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
  | `ASPNETCORE_ENVIRONMENT`              | `Production`                                                                                                    |
  | `ConnectionStrings__Default`          | chuỗi kết nối Azure SQL ở bước 1                                                                                |
  | `App__SelfUrl`                        | URL của chính service này (Render cho biết sau khi tạo, dạng `https://eform-authserver.onrender.com` — set tạm rồi quay lại sửa đúng sau khi có URL thật) |
  | `App__ClientUrl`                      | URL Cloudflare Pages (set tạm, sửa lại ở bước 7)                                                                |
  | `App__CorsOrigins`                    | URL Cloudflare Pages                                                                                            |
  | `App__RedirectAllowedUrls`            | URL Cloudflare Pages                                                                                            |
  | `StringEncryption__DefaultPassPhrase` | **đổi khác** giá trị mẫu trong `appsettings.json` — tự sinh 1 chuỗi ngẫu nhiên đủ dài                          |

- Deploy lần đầu, đợi build xong, copy URL thật Render cấp (vd `https://eform-authserver-xxxx.onrender.com`), quay lại sửa `App__SelfUrl` cho đúng.

### 3b. Service `eform-httpapi-host`

- New → Web Service → cùng repo → **Runtime: Docker**.
- **Dockerfile Path**: `aspnet-core/src/MS.EForm.HttpApi.Host/Dockerfile`
- **Docker Build Context Directory**: `aspnet-core`
- Plan: **Free**.
- Environment:

  | Key                                   | Value                                                             |
  | -------------------------------------- | -------------------------------------------------------------------- |
  | `ASPNETCORE_ENVIRONMENT`              | `Production`                                                     |
  | `ConnectionStrings__Default`          | chuỗi kết nối Azure SQL                                          |
  | `AuthServer__Authority`               | URL thật của service `eform-authserver` (bước 3a)                |
  | `AuthServer__RequireHttpsMetadata`    | `true`                                                            |
  | `AuthServer__SwaggerClientId`         | `EForm_Swagger`                                                  |
  | `App__CorsOrigins`                    | URL Cloudflare Pages                                              |
  | `StringEncryption__DefaultPassPhrase` | **giống hệt** giá trị đã đặt ở AuthServer (2 service phải cùng passphrase) |
  | `Captcha__Enabled`                    | `true`                                                            |
  | `Captcha__SecretKey`                  | secret key Turnstile thật (bước 4)                                |
  | `Captcha__VerifyUrl`                  | `https://challenges.cloudflare.com/turnstile/v0/siteverify`      |

- Deploy, lấy URL thật (vd `https://eform-httpapi-host-xxxx.onrender.com`) — dùng ở bước 6/7.

## 4. Tạo Cloudflare Turnstile site (captcha thật)

1. Vào Cloudflare Dashboard → **Turnstile** → **Add site**.
2. Domain: nhập domain Cloudflare Pages sẽ dùng (bước 6).
3. Copy **Site Key** (dùng cho Angular, không bí mật) và **Secret Key** (dùng cho `Captcha__SecretKey` ở bước 3b).

## 5. Chạy DbMigrator 1 lần nhắm vào Azure SQL

**Quan trọng**: phải biết domain thật của Cloudflare Pages và của service `eform-httpapi-host` **trước** bước này, vì DbMigrator seed dữ liệu OAuth client (`RootUrl`) 1 lần — sửa lại sau phải vào Administration UI thủ công.

Trong PowerShell, tại thư mục `aspnet-core/src/MS.EForm.DbMigrator`:

```powershell
$env:ConnectionStrings__Default = "<chuoi ket noi Azure SQL o buoc 1>"
$env:OpenIddict__Applications__EForm_App__RootUrl = "<domain Cloudflare Pages, vd https://eform.pages.dev>"
$env:OpenIddict__Applications__EForm_Swagger__RootUrl = "<domain eform-httpapi-host tren Render>"
dotnet run -c Release
```

Đợi log `Successfully completed all database migrations.` là xong. Sau đó đóng terminal (để không giữ lại biến môi trường chứa connection string thật trong session).

## 6. Tạo Cloudflare Pages project

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → chọn repo.
2. Build settings:
   - **Framework preset**: None (hoặc Angular nếu Cloudflare hỗ trợ nhận diện — không bắt buộc).
   - **Build command**: `npm run build:prod`
   - **Build output directory**: `angular/dist/EForm`
   - **Root directory**: `angular`
3. Deploy lần đầu (sẽ dùng URL placeholder trong `environment.prod.ts`, chưa hoạt động đúng — sẽ sửa ở bước 7).

## 7. Hoàn thiện URL thật (bước cuối, lặp lại nếu cần)

Mở `angular/src/environments/environment.prod.ts`, thay các dòng có comment `// TODO-DEPLOY:`:

- `baseUrl` → domain Cloudflare Pages thật (bước 6).
- `oAuthConfig.issuer` → domain `eform-authserver` thật (bước 3a), có dấu `/` ở cuối.
- `apis.default.url` → domain `eform-httpapi-host` thật (bước 3b).
- `captchaSiteKey` → site key Turnstile thật (bước 4).

Commit + push — Cloudflare Pages tự động rebuild. Đồng thời quay lại Render, kiểm tra `App__CorsOrigins` / `App__RedirectAllowedUrls` / `App__ClientUrl` ở cả 2 service đã trỏ đúng domain Cloudflare Pages thật chưa (nếu ban đầu đặt tạm, giờ sửa lại và service sẽ tự redeploy).

## 8. Kiểm tra cuối

1. Mở domain Cloudflare Pages — trang phải load được (không lỗi CORS trong Console).
2. Thử đăng nhập — phải redirect qua AuthServer và quay lại được (xác nhận OpenIddict + CORS + Data Protection Keys hoạt động đúng).
3. Thử nộp 1 form có captcha — xác nhận Turnstile thật hoạt động.
4. Để im 20 phút không thao tác, gọi lại — xác nhận cold-start hoạt động (chậm nhưng không lỗi).
5. Nếu lỗi CORS/redirect: kiểm tra lại đúng domain (có/không có dấu `/` cuối, đúng `https://`) ở cả appsettings env var (Render) lẫn `environment.prod.ts` (Cloudflare Pages) — 2 nơi phải khớp nhau.
