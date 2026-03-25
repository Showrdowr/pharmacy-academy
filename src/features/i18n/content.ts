import type {AppLocale} from '@/i18n/config';

export function getLocalizedContent(
    locale: AppLocale,
    primary: string | null | undefined,
    secondary?: string | null | undefined,
) {
    const primaryValue = typeof primary === 'string' ? primary.trim() : '';
    const secondaryValue = typeof secondary === 'string' ? secondary.trim() : '';

    if (locale === 'en' && secondaryValue) {
        return secondaryValue;
    }

    if (primaryValue) {
        return primaryValue;
    }

    if (secondaryValue) {
        return secondaryValue;
    }

    return '';
}
