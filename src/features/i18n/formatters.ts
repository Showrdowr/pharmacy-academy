import type {AppLocale} from '@/i18n/config';

const localeMap: Record<AppLocale, string> = {
    th: 'th-TH',
    en: 'en-US',
};

function resolveIntlLocale(locale: AppLocale) {
    return localeMap[locale];
}

function toValidDate(value: Date | string | null | undefined) {
    if (!value) {
        return null;
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLocaleDate(
    value: Date | string | null | undefined,
    locale: AppLocale,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    },
) {
    const date = toValidDate(value);
    if (!date) {
        return '-';
    }

    return new Intl.DateTimeFormat(resolveIntlLocale(locale), options).format(date);
}

export function formatLocaleDateTime(
    value: Date | string | null | undefined,
    locale: AppLocale,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    },
) {
    return formatLocaleDate(value, locale, options);
}

export function formatLocaleNumber(value: number, locale: AppLocale) {
    return new Intl.NumberFormat(resolveIntlLocale(locale)).format(value);
}

export function getFreeLabel(locale: AppLocale) {
    return locale === 'en' ? 'Free' : 'ฟรี';
}

export function getCurrencyUnitLabel(locale: AppLocale) {
    return locale === 'en' ? 'THB' : 'บาท';
}

export function formatLocaleCurrency(value: unknown, locale: AppLocale) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return getFreeLabel(locale);
    }

    const formatted = new Intl.NumberFormat(resolveIntlLocale(locale), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parsed);

    return locale === 'en' ? `THB ${formatted}` : `฿${formatted}`;
}
