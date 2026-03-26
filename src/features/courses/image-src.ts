const COURSE_FALLBACK_IMAGE = '/assets/img/courses/01.jpg';
const ABSOLUTE_IMAGE_PATTERN = /^(https?:\/\/|data:|blob:)/i;
const PROTOCOL_RELATIVE_IMAGE_PATTERN = /^\/\//;
const BASE64_PATTERN = /^[A-Za-z0-9+/=\r\n]+$/;

export function normalizeCourseImageSrc(src?: string): string {
  if (!src) return COURSE_FALLBACK_IMAGE;

  const normalized = src.trim();
  if (!normalized) return COURSE_FALLBACK_IMAGE;
  if (ABSOLUTE_IMAGE_PATTERN.test(normalized) || PROTOCOL_RELATIVE_IMAGE_PATTERN.test(normalized)) return normalized;
  if (normalized.startsWith('/')) return normalized;

  const sanitized = normalized.replace(/\s+/g, '');
  if (sanitized.length > 100 && BASE64_PATTERN.test(sanitized)) {
    return `data:image/jpeg;base64,${sanitized}`;
  }

  return `/${normalized}`;
}

export function shouldUseNativeImageTag(src: string) {
  return src.startsWith('data:') || src.startsWith('//');
}

export { COURSE_FALLBACK_IMAGE };
