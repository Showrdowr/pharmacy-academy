import { defaultLocale, type AppLocale } from '@/i18n/config';
import { formatLocaleCurrency } from '@/features/i18n';

export function getNumericCoursePrice(price: unknown): number | null {
    const parsed = Number(price);
    return Number.isFinite(parsed) ? parsed : null;
}

export function isFreeCourse(price: unknown): boolean {
    const normalizedPrice = getNumericCoursePrice(price);
    return normalizedPrice === null || normalizedPrice <= 0;
}

export function formatCoursePrice(price: unknown, locale: AppLocale = defaultLocale): string {
    return formatLocaleCurrency(price, locale);
}
