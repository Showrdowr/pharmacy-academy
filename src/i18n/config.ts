import type {AbstractIntlMessages} from 'next-intl';

export const appLocales = ['th', 'en'] as const;
export type AppLocale = (typeof appLocales)[number];

export const defaultLocale: AppLocale = 'th';
export const localeCookieName = 'NEXT_LOCALE';
export const localeClassPrefix = 'lang-';

export function isAppLocale(value: string | null | undefined): value is AppLocale {
    return value === 'th' || value === 'en';
}

function mergeMessages(...parts: AbstractIntlMessages[]) {
    return Object.assign({}, ...parts);
}

async function loadThaiMessages() {
    const [common, navigation, auth, courses, learning, payment, profile] = await Promise.all([
        import('@/messages/th/common.json'),
        import('@/messages/th/navigation.json'),
        import('@/messages/th/auth.json'),
        import('@/messages/th/courses.json'),
        import('@/messages/th/learning.json'),
        import('@/messages/th/payment.json'),
        import('@/messages/th/profile.json'),
    ]);

    return mergeMessages(
        common.default,
        navigation.default,
        auth.default,
        courses.default,
        learning.default,
        payment.default,
        profile.default,
    );
}

async function loadEnglishMessages() {
    const [common, navigation, auth, courses, learning, payment, profile] = await Promise.all([
        import('@/messages/en/common.json'),
        import('@/messages/en/navigation.json'),
        import('@/messages/en/auth.json'),
        import('@/messages/en/courses.json'),
        import('@/messages/en/learning.json'),
        import('@/messages/en/payment.json'),
        import('@/messages/en/profile.json'),
    ]);

    return mergeMessages(
        common.default,
        navigation.default,
        auth.default,
        courses.default,
        learning.default,
        payment.default,
        profile.default,
    );
}

export async function loadMessages(locale: AppLocale) {
    return locale === 'en' ? loadEnglishMessages() : loadThaiMessages();
}
