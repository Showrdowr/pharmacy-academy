import { defaultLocale, type AppLocale } from '@/i18n/config';
import { formatLocaleDate } from '@/features/i18n';

export const formatThaiDate = (
    date: string | Date | null | undefined,
    locale: AppLocale = defaultLocale,
): string => {
    return formatLocaleDate(date, locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

export const formatThaiDateShort = (
    date: string | Date | null | undefined,
    locale: AppLocale = defaultLocale,
): string => {
    return formatLocaleDate(date, locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};
