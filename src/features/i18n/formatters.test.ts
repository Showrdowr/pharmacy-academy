import { getLocalizedContent } from './content';
import {
    formatLocaleCurrency,
    formatLocaleDate,
    formatLocaleNumber,
    getCurrencyUnitLabel,
    getFreeLabel,
} from './formatters';

describe('i18n formatters', () => {
    it('formats currency according to locale policy', () => {
        expect(formatLocaleCurrency(1500, 'th')).toBe('฿1,500');
        expect(formatLocaleCurrency(1500, 'en')).toBe('THB 1,500');
    });

    it('returns locale-specific free labels and currency unit labels', () => {
        expect(getFreeLabel('th')).toBe('ฟรี');
        expect(getFreeLabel('en')).toBe('Free');
        expect(getCurrencyUnitLabel('th')).toBe('บาท');
        expect(getCurrencyUnitLabel('en')).toBe('THB');
        expect(formatLocaleCurrency(0, 'th')).toBe('ฟรี');
        expect(formatLocaleCurrency(0, 'en')).toBe('Free');
    });

    it('formats dates and numbers without falling back to placeholder for valid values', () => {
        expect(formatLocaleDate('2024-01-15T12:00:00.000Z', 'en')).toContain('2024');
        expect(formatLocaleDate('2024-01-15T12:00:00.000Z', 'th')).toContain('15');
        expect(formatLocaleNumber(1234567, 'en')).toBe('1,234,567');
        expect(formatLocaleNumber(1234567, 'th')).toBe('1,234,567');
    });

    it('falls back to primary content when localized secondary content is missing', () => {
        expect(getLocalizedContent('en', 'ชื่อภาษาไทย', 'English title')).toBe('English title');
        expect(getLocalizedContent('en', 'ชื่อภาษาไทย', '')).toBe('ชื่อภาษาไทย');
        expect(getLocalizedContent('th', 'ชื่อภาษาไทย', 'English title')).toBe('ชื่อภาษาไทย');
    });
});
