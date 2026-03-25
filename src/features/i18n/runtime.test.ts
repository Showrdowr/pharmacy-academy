import { getClientMessage, getCurrentLocale } from './runtime';

describe('i18n runtime helpers', () => {
    beforeEach(() => {
        document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.documentElement.lang = 'th';
    });

    it('resolves the current locale from the locale cookie first', () => {
        document.cookie = 'NEXT_LOCALE=en; path=/';
        document.documentElement.lang = 'th';

        expect(getCurrentLocale()).toBe('en');
    });

    it('falls back to the document language when the cookie is missing', () => {
        document.documentElement.lang = 'en';

        expect(getCurrentLocale()).toBe('en');
    });

    it('returns localized messages and interpolates values', () => {
        expect(getClientMessage('auth.headerButtons.greeting', { name: 'Pat' }, 'th')).toBe('สวัสดี, Pat');
        expect(getClientMessage('auth.headerButtons.greeting', { name: 'Pat' }, 'en')).toBe('Hello, Pat');
        expect(getClientMessage('payment.checkout.voucherMinimumOrder', { amount: 2000 }, 'en')).toBe('Minimum order 2000 THB');
    });
});
