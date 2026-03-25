"use client";

import {useRouter} from 'next/navigation';
import {useCallback} from 'react';
import {useLocale} from 'next-intl';
import {defaultLocale, isAppLocale, localeClassPrefix, localeCookieName, type AppLocale} from '@/i18n/config';

const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

function applyLocaleToDocument(locale: AppLocale) {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.lang = locale;
    document.documentElement.classList.remove(`${localeClassPrefix}th`, `${localeClassPrefix}en`);
    document.documentElement.classList.add(`${localeClassPrefix}${locale}`);
}

function persistLocale(locale: AppLocale) {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${localeCookieMaxAgeSeconds}; samesite=lax`;
}

export function useAppLocale() {
    const router = useRouter();
    const localeFromContext = useLocale();
    const locale = isAppLocale(localeFromContext) ? localeFromContext : defaultLocale;

    const setLocale = useCallback((nextLocale: AppLocale) => {
        if (!isAppLocale(nextLocale) || nextLocale === locale) {
            return;
        }

        persistLocale(nextLocale);
        applyLocaleToDocument(nextLocale);
        router.refresh();
    }, [locale, router]);

    const toggleLocale = useCallback(() => {
        setLocale(locale === 'th' ? 'en' : 'th');
    }, [locale, setLocale]);

    return {
        locale,
        setLocale,
        toggleLocale,
    };
}
