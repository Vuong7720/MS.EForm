# EForm — Tài liệu dự án & Hướng dẫn sử dụng

> Tài liệu này mô tả bối cảnh ra đời, kiến trúc, và hướng dẫn sử dụng toàn bộ chức năng của hệ thống EForm.

## 1. Giới thiệu & bối cảnh

EForm là hệ thống quản lý **biểu mẫu điện tử (e-form)** ra đời từ một nhu cầu thực tế: quản lý một trang web thông tin hành chính có nhiều form/poster phải thay đổi nội dung thường xuyên, nhưng mỗi lần đổi nội dung lại phải build lại và triển khai lại toàn bộ trang — rất mất thời gian.

Vì bản chất là các văn bản hành chính (công văn, đơn từ, hợp đồng ủy quyền...), giao diện của các "form" này thường trông giống **văn bản** hơn là biểu mẫu nhập liệu thông thường — các form builder có sẵn trên thị trường không đáp ứng được yêu cầu trình bày này. EForm được xây dựng để giải quyết đúng bài toán đó: cho phép soạn nội dung dạng văn bản tự do (rich text) và **chèn các field nhập liệu ngay bên trong nội dung đó**, đồng thời cho phép thay đổi toàn bộ nội dung/cấu trúc form tại runtime — không cần build lại code.

## 2. Kiến trúc hệ thống

**Backend** — ASP.NET Boilerplate / ABP Framework (.NET), theo mô hình layered DDD:

| Project | Vai trò |
|---|---|
| `MS.EForm.Domain` / `Domain.Shared` | Entity & enum cốt lõi |
| `MS.EForm.Application` / `Application.Contracts` | Business logic, DTO, interface service, permission |
| `MS.EForm.EntityFrameworkCore` | Data access (EF Core, SQL Server) |
| `MS.EForm.HttpApi` / `HttpApi.Client` | REST API (1 controller gộp: `EFormController`) |
| `MS.EForm.HttpApi.Host` | Host chạy API, lưu file đính kèm trong `App_Data/form-attachments` |
| `MS.EForm.AuthServer` | OAuth/OpenIddict server riêng |
| `MS.EForm.DbMigrator` | Console app: áp dụng migration + seed dữ liệu (role/permission/template mẫu) |

**Frontend** — Angular 19, mỗi nhóm chức năng là 1 module lazy-load riêng (`form`, `form_categories`, `form-records`, `form-submit`, `form-templates`, `page_sections`, `showcase`...). Các trang public (không cần đăng nhập) dùng layout `empty` (không sidebar), các trang quản trị dùng layout `application`.

**Dữ liệu form được thiết kế "phẳng, linh hoạt"**: nội dung form là 1 khối HTML tự do (soạn bằng TinyMCE), trong đó các field được chèn dưới dạng `<span class="drag-field field-type-N" id="{code}">`. Khi hiển thị (nộp form / xem kết quả), hệ thống parse khối HTML này và thay từng span bằng input/select/... thật tương ứng. Dữ liệu nộp lưu dạng `Dictionary<string, string>` (JSON), key là **mã (code)** của field — không phải tên (title) — nên nhiều field trùng tên (VD "Họ và tên" ở cả bên A và bên B trong hợp đồng) vẫn lưu đúng miễn mã khác nhau.

## 3. Phân quyền

Mọi quyền nằm trong nhóm `EForm`, quản lý qua Administration > Roles > Permissions:

| Nhóm quyền | Ý nghĩa |
|---|---|
| `EForm.FormCategories` | Quản lý danh mục biểu mẫu |
| `EForm.Forms` | Tạo/sửa/xóa biểu mẫu |
| `EForm.FormFields` | Quản lý field (ít dùng trực tiếp — thường quản lý qua modal sửa biểu mẫu) |
| `EForm.FormRecords` | Xem/sửa/xóa/phê duyệt kết quả nộp form |
| `EForm.Pages` | Quản lý các trang giới thiệu (Page) - tên, đường dẫn (slug), bật/tắt |
| `EForm.PageSections` | Cấu hình khu vực hiển thị trong 1 trang giới thiệu |

Các endpoint public (nộp form, xem nội dung form để nộp, xem trang giới thiệu) **cố tình không yêu cầu quyền** vì phục vụ người dùng ngoài hệ thống.

## 3b. Trang chủ (Dashboard)

Trang chủ sau khi đăng nhập (`/`) hiển thị tổng quan:
- Tổng số biểu mẫu, tổng số lượt nộp.
- **Biểu đồ lượt nộp 14 ngày gần nhất** (cột theo từng ngày, kể cả ngày không có lượt nộp nào).
- **Trạng thái phê duyệt** (Chờ duyệt / Đã duyệt / Từ chối) — chỉ hiện khi có ít nhất 1 bản ghi thuộc form có bật "Cần phê duyệt" (form không dùng phê duyệt sẽ không hiện khối này).
- Top 5 biểu mẫu nhiều lượt nộp nhất — bấm vào 1 dòng để xem toàn bộ kết quả nộp của form đó.

## 4. Quản lý danh mục biểu mẫu

Trang **Danh mục biểu mẫu** (`/form-category`): CRUD đơn giản (Tên, Mô tả, Thứ tự). Mỗi biểu mẫu thuộc 1 danh mục, dùng để phân loại và lọc.

## 5. Xây dựng biểu mẫu

Trang **Biểu mẫu** (`/form`) → nút "Thêm mới biểu mẫu" mở modal gồm 2 phần:

- **Nội dung biểu mẫu**: soạn thảo rich text (TinyMCE) như soạn 1 văn bản thật — có thể chèn ảnh, bảng, định dạng chữ tự do.
- **Danh sách thuộc tính** (field): thêm field mới bằng nút "+", cấu hình xong thì **kéo (drag) field từ danh sách vào đúng vị trí mong muốn trong nội dung** — field hiển thị trong khung soạn thảo dưới dạng 1 ô viền nét đứt, không thể gõ chữ vào bên trong (tránh phá vỡ vị trí field khi soạn thảo).

Các tùy chọn chung của form: **Cần phê duyệt trước khi được xem là đã duyệt** (bật luồng approval), **Gửi email thông báo khi có người nộp**.

### Ràng buộc & tiện ích khi thêm field

- **Mã (code) phải duy nhất trong 1 form** — tên (title) có thể trùng nhau (VD "Họ và tên" ở nhiều chỗ), nhưng mã thì không. Hệ thống tự sinh mã từ tên (viết tắt chữ cái đầu, bỏ dấu), báo lỗi ngay nếu trùng — cả khi gõ tên lẫn khi tự tay sửa mã. Nếu cố kéo field đã có sẵn trong nội dung vào lần 2, hệ thống chặn và báo lỗi (tránh 2 field trùng `id` trong DOM).
- **Sao chép field**: icon "Sao chép" bên cạnh mỗi field trong danh sách — tạo ngay 1 bản sao cùng cấu hình, tự sinh tên/mã mới, hữu ích khi cần nhiều field cấu trúc giống nhau (VD nhiều dòng "Họ tên/Ngày sinh" trong 1 hợp đồng).
- **Xóa field**: xóa khỏi danh sách sẽ tự động dọn luôn span tương ứng đã kéo vào nội dung (nếu có), tránh field "mồ côi" vẫn hiển thị dù không còn quản lý được.
- **Nhân bản toàn bộ form**: hành động "Nhân bản form" trong danh sách Biểu mẫu — tạo ngay 1 form mới với nội dung + toàn bộ field giống hệt form gốc, tự đặt tên "{Tên gốc} (Bản sao)". Khác với "Sao chép field" (chỉ nhân bản 1 field trong lúc soạn thảo), tính năng này nhân bản **cả form**, hữu ích khi cần 1 biến thể của form đã có mà không muốn dựng lại từ đầu.

## 6. Các kiểu field & cấu hình

| # | Kiểu | Mô tả & cấu hình riêng |
|---|---|---|
| 1 | **Text** | 1 dòng. Hỗ trợ độ dài tối thiểu/tối đa, định dạng regex tùy chọn. |
| 2 | **AreaText** | Nhiều dòng (textarea). Cùng ràng buộc độ dài như Text. |
| 3 | **Select** | Dropdown, danh sách lựa chọn nhập cách nhau bởi dấu phẩy. |
| 4 | **CheckBox** | Chọn nhiều. Hỗ trợ **hướng xếp** ngang/dọc. |
| 5 | **Radio** | Chọn 1. Cùng tùy chọn hướng xếp ngang/dọc như CheckBox. |
| 6 | **DateTime** | Chọn ngày giờ. Có cờ **"Chỉ chọn ngày"** để ẩn phần chọn giờ khi không cần. |
| 7 | **Number** | Số, hỗ trợ giá trị tối thiểu/tối đa. |
| 8 | **Boolean** | Dropdown "Có/Không". |
| 9 | **Upload file/ảnh** | Giới hạn định dạng, dung lượng/file, số file tối đa. Có cờ **"Hiện ảnh xem trước"** — hiện thumbnail ngay dưới file đã chọn nếu là ảnh. |
| 10 | **Chữ ký điện tử** | Ký tay bằng chuột/cảm ứng trên canvas, xuất ảnh PNG lưu như 1 file đính kèm. |
| 11 | **Đánh giá (Rating)** | Chọn số sao, cấu hình số sao tối đa. |
| 12 | **Danh sách (nhóm field lặp — Group)** | Xem mục 7 bên dưới. |

**Cấu hình áp dụng cho mọi kiểu field:**
- **Bắt buộc nhập** (required).
- **Màu chữ tùy chỉnh** — đổi màu hiển thị riêng cho field đó (mặc định kế thừa màu văn bản xung quanh), hữu ích khi cần nhấn mạnh 1 vùng nhập liệu trong văn bản.
- **Hiện field theo điều kiện** — chỉ hiện/bắt buộc field này khi **một hoặc nhiều** field khác thỏa điều kiện (Bằng / Khác / Chứa / Bỏ trống / Đã nhập). Có thể thêm nhiều điều kiện và chọn cách kết hợp: **Tất cả điều kiện đúng (AND)** hoặc **Chỉ cần 1 điều kiện đúng (OR)**. VD: chỉ hiện ô "Lý do từ chối" khi field "Kết quả" = "Từ chối" VÀ "Người duyệt" đã nhập.

**Validate**: mọi ràng buộc (required, độ dài, định dạng, khoảng giá trị, danh sách lựa chọn hợp lệ...) được kiểm tra **cả ở trình duyệt lẫn ở server** — validate phía trình duyệt chỉ để trải nghiệm mượt hơn, quyết định cuối cùng luôn ở server.

## 7. Field nhóm lặp (Group) — dùng cho danh sách lặp lại

Dùng khi 1 form cần lặp lại 1 nhóm field nhiều lần với số dòng không cố định — ví dụ "Danh sách người được ủy quyền", mỗi người có Họ tên/Ngày sinh/CCCD riêng, nhưng số người thì không biết trước.

**Cấu hình khi tạo field Group:**
- **Số dòng tối thiểu / tối đa** (để trống = không giới hạn tối đa). "Bắt buộc nhập" tương đương tối thiểu 1 dòng.
- **Danh sách field con**: mỗi field con có Tên, Kiểu dữ liệu (giới hạn các kiểu đơn giản: Text, AreaText, Select, CheckBox, Radio, DateTime, Number, Boolean — không hỗ trợ Upload file/Chữ ký/Rating/Group lồng nhau, để tránh quá phức tạp khi phải quản lý file đính kèm hay nhóm lồng theo từng dòng lặp), Bắt buộc nhập, và Danh sách lựa chọn (nếu là Select/CheckBox/Radio).

**Khi hiển thị**: form hiện các dòng lặp với đầy đủ field con, nút "+ Thêm dòng" / "Xóa dòng" (tôn trọng min/max đã cấu hình). Dữ liệu lưu dưới dạng 1 chuỗi JSON (mảng các dòng) — theo đúng khuôn dạng đã dùng cho field Upload file/Chữ ký (1 field = 1 chuỗi JSON gói toàn bộ dữ liệu con).

**Xuất Excel**: field Group không có 1 cột duy nhất — **mỗi field con xuất thành 1 cột riêng** (tiêu đề "Tên nhóm - Tên field con"), giá trị của các dòng nối với nhau bằng dấu `;`.

## 8. Mẫu có sẵn (Form Templates)

Trang **Mẫu có sẵn** (`/form-templates`): thư viện các mẫu văn bản hành chính dựng sẵn (Giấy ủy quyền, Đơn xin nghỉ phép, Sơ yếu lý lịch, Đơn khởi kiện, Tờ khai đăng ký khai sinh, Phiếu đăng ký sự kiện...). Nút **"Dùng mẫu này"** mở modal tạo form mới, điền sẵn toàn bộ nội dung/field của mẫu — chỉnh sửa tùy ý trước khi lưu thành 1 biểu mẫu thật của bạn. Nút **"Tạo mẫu mới"** cho phép lưu 1 form đang có thành mẫu dùng lại sau này.

## 8b. Mã QR cho biểu mẫu

Mỗi biểu mẫu (menu "Biểu mẫu") có thêm hành động **"Hiện mã QR"** bên cạnh "Sao chép link nộp form" - hiện mã QR trỏ thẳng vào `/submit-form/:formId`, kèm nút tải ảnh PNG để in kèm lên poster giấy dán ở trụ sở. Quét mã là vào thẳng trang nộp form, không cần gõ URL. Trang giới thiệu (mục 11) cũng có mã QR tương tự cho từng trang.

## 9. Nộp form công khai

Mỗi biểu mẫu có 1 trang nộp public tại `/submit-form/:formId` — không cần đăng nhập, không hiện sidebar quản trị. Trang này:

- Render nội dung + field thật từ form.
- Chống spam bằng **Cloudflare Turnstile** (captcha) — bắt buộc xác thực xong mới bật được nút "Nộp form". Ngoài ra còn giới hạn 10 request/phút/IP ở tầng server.
- Input dạng Text **tự giãn bề rộng** theo nội dung đang gõ, tránh bị cắt chữ khi gõ dài.
- Field Upload file/Chữ ký gọi API upload riêng trước, lưu lại tên blob — chỉ chấp nhận file đã upload thật (chặn giả mạo đường dẫn).
- Khi nộp, hệ thống **đóng băng (snapshot)** toàn bộ nội dung + cấu trúc field tại thời điểm đó vào chính bản ghi — nếu sau này bạn sửa lại form gốc (đổi nội dung, thêm/bớt field), các bản ghi cũ vẫn hiển thị/validate đúng theo cấu trúc lúc chúng được nộp, không bị ảnh hưởng ngược.

## 10. Kết quả nộp form

Trang **Kết quả nộp form** (`/form-records`): danh sách bản ghi theo từng form, lọc theo tiêu đề/trạng thái duyệt, xem chi tiết từng bản ghi (`/form-records/view/:id`) với đầy đủ dữ liệu đã nộp, có thể **sửa lại** dữ liệu nếu cần.

**Tìm kiếm nâng cao**: ô "Tìm theo nội dung đã nhập" tìm bản ghi theo **bất kỳ giá trị nào đã điền ở bất kỳ field nào** (vd tên người, số CCCD), khác với tìm theo tiêu đề bản ghi (chỉ khớp đúng tên bản ghi).

**Phê duyệt**: nếu form bật "Cần phê duyệt", mỗi bản ghi có trạng thái Pending/Approved/Rejected, người có quyền `EForm.FormRecords.Approve` có thể duyệt/từ chối kèm ghi chú.

**Xuất dữ liệu**: nút xuất Excel (`export-excel-form-record`) — mỗi field 1 cột (riêng Group thì mỗi field con 1 cột, xem mục 7). Nút **Xuất PDF** dùng chính chức năng in của trình duyệt (giữ nguyên layout/màu nền của form gốc) — người dùng chọn "Lưu dưới dạng PDF" ngay trong hộp thoại in.

**Thao tác hàng loạt**: tick chọn nhiều dòng bằng checkbox đầu bảng (chọn được xuyên nhiều trang, không mất khi đổi trang) — thanh công cụ hiện ra cho phép **Duyệt đã chọn**/**Từ chối đã chọn** (khi form yêu cầu phê duyệt) và **Xóa đã chọn** cùng lúc, thay vì phải lặp lại thao tác từng dòng một. Bản ghi lỗi (vd đã bị xóa trước đó) tự động bị bỏ qua, không làm hỏng cả batch.

## 11. Trang giới thiệu (Showcase / Page Builder)

Tính năng cho phép **trình diễn trực tiếp các biểu mẫu trên 1 hoặc nhiều trang public đẹp mắt**, phù hợp để giới thiệu sản phẩm hoặc nhúng vào website chính. Hệ thống hỗ trợ **nhiều trang giới thiệu (Page)** độc lập, mỗi trang có đường dẫn (slug) riêng.

- **Quản lý trang** tại `/pages` (quyền `EForm.Pages`): mỗi trang giới thiệu gồm Tên, Đường dẫn (slug, vd `/showcase/gioi-thieu-2026`), Mô tả, cờ Bật/Tắt. Có thể tạo nhiều trang cho nhiều mục đích khác nhau (vd 1 trang giới thiệu chung, 1 trang riêng cho sự kiện Trung Thu, 1 trang demo riêng để chào hàng 1 khách hàng cụ thể...). Mỗi trang có mã QR + link sao chép riêng.
- **Nhân bản trang** — nút "Nhân bản" trong danh sách `/pages` sao chép toàn bộ 1 trang **kèm mọi khu vực hiển thị của nó** thành 1 trang mới (tên/slug tự thêm hậu tố tránh trùng). Trang mới luôn tạo ở trạng thái **Tắt** để admin rà soát/chỉnh sửa trước khi công khai — hữu ích khi cần dựng nhanh 1 biến thể từ trang đã có (vd theo mùa sự kiện năm sau, hoặc riêng cho 1 khách hàng khác) thay vì dựng lại từ đầu.
- **Tùy biến thương hiệu theo từng trang** — mỗi trang có thể đặt riêng **Tên thương hiệu** (hiện ở góc trên trang, thay cho "EForm" mặc định) và **Màu chủ đạo** (hex, áp dụng cho toàn bộ gradient hero + nút bấm). Rất hữu ích khi demo/chào hàng: có thể dựng nhanh 1 trang giới thiệu mang đúng màu sắc/tên thương hiệu của khách hàng đang thuyết phục, thay vì 1 giao diện chung chung.
- **Cấu hình khu vực hiển thị** tại `/page-sections` (quyền `EForm.PageSections`): chọn trang giới thiệu ở đầu màn hình, sau đó thêm "khu vực hiển thị" (section) gồm Tên, Mô tả ngắn, Thứ tự hiển thị, cờ Bật/Tắt, và chọn **1 trong 2 loại khu vực**:
  - **Nhúng biểu mẫu** — gán 1 form có sẵn, người xem điền và nộp trực tiếp ngay trên trang (như trước đây).
  - **Khối nội dung tùy chỉnh** — soạn nội dung tự do bằng trình soạn thảo rich-text (ảnh, bảng, định dạng...), **không cần tạo Form nào cả**. Dùng cho poster, thông báo, hoặc bất kỳ nội dung trình bày thuần nào không cần thu thập dữ liệu — đúng với việc phạm vi sử dụng đã mở rộng ra ngoài "biểu mẫu" (form) sang trình bày nội dung tùy chỉnh nói chung.
  Không giới hạn số khu vực mỗi trang. Khi toàn bộ danh sách hiện gọn trong 1 trang, có thể **kéo thả trực tiếp** (biểu tượng ở đầu mỗi dòng) để sắp xếp lại thứ tự nhanh, không cần sửa số thủ công; danh sách dài hơn 1 trang vẫn sắp xếp được bằng cách sửa số Thứ tự hiển thị ở từng khu vực.
- **Lịch hiển thị theo thời gian** — mỗi khu vực có thể đặt thêm "Hiển thị từ ngày" / "Hiển thị đến ngày" (tùy chọn, để trống = không giới hạn). Ngoài khoảng thời gian này, khu vực **tự động ẩn khỏi trang public** dù vẫn đang bật (IsActive) — vd đặt lịch cho poster Trung Thu chỉ hiện trong tháng 9, tự ẩn ngay khi qua ngày mà không cần admin quay lại tắt tay. Danh sách hiện badge "Chưa tới hạn"/"Đã hết hạn" để dễ theo dõi.
- **Nhúng qua iframe vào website khác** — mỗi khu vực có hành động "Sao chép mã nhúng (iframe)" trong menu `...`, sinh sẵn đoạn `<iframe src=".../showcase/embed/{id}">` để dán thẳng vào BẤT KỲ trang web nào khác (không chỉ trang giới thiệu của hệ thống). Trang nhúng chỉ hiển thị đúng 1 khu vực đó (không hero, không các khu vực khác), phù hợp để cắm 1 form hoặc 1 poster ngay trên website hiện có của bạn — đúng với nhu cầu gốc: đổi nội dung/poster ngay trên website đang chạy mà không cần build lại trang đó. Cũng tôn trọng cờ Bật/Tắt và lịch hiển thị ở trên.
- **Trang public** tại `/showcase` (trang mặc định) hoặc `/showcase/{slug}` (trang cụ thể) — không cần đăng nhập: mở đầu bằng hero giới thiệu kèm dải điểm nổi bật ("Nộp tức thì", "Chống spam", "Responsive"), sau đó hiển thị lần lượt các khu vực đang bật theo đúng thứ tự. Khu vực **Nhúng biểu mẫu** nhúng form thật ngay tại chỗ (không điều hướng sang trang khác) — người xem điền và nộp trực tiếp, có captcha riêng cho từng form. Khu vực **Khối nội dung tùy chỉnh** chỉ hiển thị nội dung đã soạn — không có captcha, không có nút nộp, nhẹ hơn vì không cần gọi API tải form/field nào.
- **Minh chứng xã hội (social proof)** — mỗi form nhúng hiện kèm số lượt đã sử dụng (vd "128 lượt sử dụng") ngay trên tiêu đề, tự tính theo số bản ghi thực tế đã nộp — tăng độ tin cậy khi khách hàng xem demo (chỉ hiện khi đã có ít nhất 1 lượt nộp).
- **Hiệu ứng ăn mừng khi nộp thành công** — nộp xong hiện hiệu ứng pháo giấy (confetti) + lời cảm ơn kèm nút "Nộp thêm 1 lần nữa" để thử lại - tạo khoảnh khắc ấn tượng khi demo trực tiếp cho khách hàng.
- **Form không có field nào** (thuần nội dung/poster, không cần nhập liệu) sẽ **tự động ẩn nút "Nộp form" và captcha** — hiển thị như 1 poster tĩnh, đúng bài toán gốc: đổi nội dung poster mà không cần build lại trang. Nếu không cần cả khả năng thu thập dữ liệu (chỉ cần trình bày), dùng loại khu vực **Khối nội dung tùy chỉnh** ở trên sẽ gọn hơn vì không cần tạo Form nào.
- **Truy cập nhanh**: nút "Xem trang giới thiệu (Demo)" trên trang chủ quản trị (Dashboard) và trong menu chính, mở trang giới thiệu mặc định (`/showcase`) — không cần nhớ/gõ URL.

Trang giới thiệu mặc định (slug `demo`) đã có sẵn 3 khu vực demo (có thể sửa/xóa/thêm tại `/page-sections`):
1. **Poster Trung Thu 2026** — ví dụ nội dung dạng poster thuần (0 field).
2. **Giấy ủy quyền** — ví dụ biểu mẫu văn bản hành chính điền được.
3. **Phiếu đăng ký tham dự sự kiện** — ví dụ biểu mẫu đăng ký thông thường.

## 12. Vận hành & triển khai

**Chạy backend lần đầu / sau khi đổi cấu trúc DB:**
```
cd aspnet-core/src/MS.EForm.DbMigrator
dotnet run
```
Lệnh này áp dụng migration + seed role/quyền/mẫu form có sẵn — **chạy lại an toàn** (idempotent), kể cả khi thêm quyền mới sau này (role `admin` sẽ tự động được cấp quyền mới mà không cần thao tác thủ công).

**Chạy API:**
```
cd aspnet-core/src/MS.EForm.HttpApi.Host
dotnet run
```

**Chạy frontend:**
```
cd angular
npm start   # hoặc: ng serve
```

**Thêm 1 bảng/entity mới** (nếu phát triển tiếp): thêm Entity → khai báo `DbSet` trong `EFormDbContext.cs` → tạo migration:
```
cd aspnet-core/src/MS.EForm.EntityFrameworkCore
dotnet ef migrations add <TenMigration> --startup-project ../MS.EForm.DbMigrator/MS.EForm.DbMigrator.csproj
```
rồi chạy lại `DbMigrator` để áp dụng.

## 13. Lưu ý kỹ thuật khi phát triển tiếp

- Thư mục `angular/src/app/proxy/**` thường được sinh tự động bởi ABP proxy generator (dựa trên swagger của backend) — nếu thêm action/DTO mới ở backend, **nên chạy lại proxy generator** thay vì sửa tay các file này (một số phần hiện tại đang được viết tay mô phỏng đúng khuôn mẫu generator, do môi trường phát triển chưa có sẵn công cụ generate).
- Field Group hiện giới hạn kiểu field con đơn giản (không File/Signature/Rating/Group lồng) — đây là quyết định thiết kế có chủ đích để tránh độ phức tạp khi quản lý file đính kèm/nhóm lồng theo từng dòng lặp, không phải giới hạn kỹ thuật không thể vượt qua.
- **Gửi email chưa hoạt động thật**: `appsettings.json` của `HttpApi.Host` chưa cấu hình SMTP (`Settings:Abp.Mailing.Smtp.*`) — các tính năng gửi email (thông báo khi có người nộp form) dùng `Volo.Abp.Emailing.IEmailSender` mặc định của ABP, cần cấu hình SMTP thật trước khi dùng trong môi trường thật.
- **Thông báo cho người duyệt**: hiện chỉ gửi email cho người TẠO form khi có người nộp (`NotifyOnSubmit`), chưa có thông báo riêng cho người có quyền `EForm.FormRecords.Approve` khi có bản ghi mới cần duyệt — vì hệ thống hiện không gắn "người duyệt" cụ thể với 1 form (quyền duyệt là quyền chung theo Role, không theo từng form). Muốn có thông báo này cần thêm khái niệm người duyệt cụ thể trên `Form` trước.
