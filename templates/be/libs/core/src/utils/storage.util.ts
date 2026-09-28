/**
 * Ghép avatar path với S3 base URL.
 * Trả null nếu path là null/undefined.
 *
 * @example
 * resolveS3Url('uploads/devices/abc.png', 'https://bucket.s3.ap-southeast-1.amazonaws.com')
 * // → 'https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/devices/abc.png'
 */
export function resolveS3Url(path: string | null | undefined, baseUrl: string): string | null {
  if (!path) return null;
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Lọc bỏ S3 base URL khỏi giá trị avatar, trả về path thuần để lưu DB.
 * Nếu client truyền full URL thì strip prefix; nếu truyền path thì giữ nguyên.
 * Trả null nếu value là null/undefined.
 *
 * @example
 * stripS3BaseUrl('https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/devices/abc.png', 'https://bucket.s3.ap-southeast-1.amazonaws.com')
 * // → 'uploads/devices/abc.png'
 *
 * stripS3BaseUrl('uploads/devices/abc.png', 'https://bucket.s3.ap-southeast-1.amazonaws.com')
 * // → 'uploads/devices/abc.png'
 */
export function stripS3BaseUrl(value: string | null | undefined, baseUrl: string): string | null {
  if (!value) return null;
  const normalizedBase = baseUrl.replace(/\/$/, '');
  if (value.startsWith(normalizedBase)) {
    return value.slice(normalizedBase.length).replace(/^\//, '');
  }
  return value.replace(/^\//, '');
}
