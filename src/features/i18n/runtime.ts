import type {AppLocale} from '@/i18n/config';
import {defaultLocale, isAppLocale, localeCookieName} from '@/i18n/config';
import thCommon from '@/messages/th/common.json';
import enCommon from '@/messages/en/common.json';
import thAuth from '@/messages/th/auth.json';
import enAuth from '@/messages/en/auth.json';
import thPayment from '@/messages/th/payment.json';
import enPayment from '@/messages/en/payment.json';

type TranslationValues = Record<string, string | number>;

const messageCatalog = {
    th: {
        ...thCommon,
        ...thAuth,
        ...thPayment,
    },
    en: {
        ...enCommon,
        ...enAuth,
        ...enPayment,
    },
} satisfies Record<AppLocale, Record<string, unknown>>;

function getCookieValue(name: string) {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookie = document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function getMessageValue(source: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((current, segment) => {
        if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
            return (current as Record<string, unknown>)[segment];
        }

        return undefined;
    }, source);
}

function interpolateMessage(template: string, values: TranslationValues) {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function getCurrentLocale(): AppLocale {
    const cookieLocale = getCookieValue(localeCookieName);
    if (isAppLocale(cookieLocale)) {
        return cookieLocale;
    }

    if (typeof document !== 'undefined') {
        const documentLocale = document.documentElement.lang?.trim();
        if (isAppLocale(documentLocale)) {
            return documentLocale;
        }
    }

    return defaultLocale;
}

export function getClientMessage(
    path: string,
    values: TranslationValues = {},
    locale: AppLocale = getCurrentLocale(),
) {
    const template = getMessageValue(messageCatalog[locale], path);

    if (typeof template !== 'string') {
        return path;
    }

    return interpolateMessage(template, values);
}
