import { fireEvent, render, screen } from '@testing-library/react';

const refreshMock = vi.fn();
let mockedLocale: 'th' | 'en' = 'th';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: refreshMock,
    }),
}));

vi.mock('next-intl', () => ({
    useLocale: () => mockedLocale,
}));

import { useAppLocale } from './useAppLocale';

function LocaleHarness() {
    const { locale, setLocale, toggleLocale } = useAppLocale();

    return (
        <div>
            <span data-testid="locale">{locale}</span>
            <button type="button" onClick={() => setLocale('en')}>
                set-en
            </button>
            <button type="button" onClick={() => toggleLocale()}>
                toggle
            </button>
        </div>
    );
}

describe('useAppLocale', () => {
    beforeEach(() => {
        mockedLocale = 'th';
        refreshMock.mockClear();
        document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.documentElement.lang = 'th';
        document.documentElement.className = 'lang-th';
    });

    it('persists locale to cookie and updates document metadata before refresh', () => {
        render(<LocaleHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'set-en' }));

        expect(screen.getByTestId('locale')).toHaveTextContent('th');
        expect(document.cookie).toContain('NEXT_LOCALE=en');
        expect(document.documentElement.lang).toBe('en');
        expect(document.documentElement.classList.contains('lang-en')).toBe(true);
        expect(document.documentElement.classList.contains('lang-th')).toBe(false);
        expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it('toggles from thai to english using the current locale from context', () => {
        render(<LocaleHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

        expect(document.cookie).toContain('NEXT_LOCALE=en');
        expect(document.documentElement.lang).toBe('en');
        expect(refreshMock).toHaveBeenCalledTimes(1);
    });
});
