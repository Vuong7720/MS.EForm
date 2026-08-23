// Đọc message lỗi từ response ABP trả về khi throw UserFriendlyException/BusinessException:
// { error: { code, message, details, ... } }
export function getApiErrorMessage(err: any, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại'): string {
  return err?.error?.error?.message || err?.error?.error?.details || fallback;
}
