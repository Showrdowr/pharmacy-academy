import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';
import {defaultLocale, isAppLocale, loadMessages, localeCookieName, type AppLocale} from './config';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(localeCookieName)?.value;
    const locale: AppLocale = isAppLocale(cookieLocale) ? cookieLocale : defaultLocale;

    return {
        locale,
        messages: await loadMessages(locale),
        timeZone: 'Asia/Bangkok',
    };
});
