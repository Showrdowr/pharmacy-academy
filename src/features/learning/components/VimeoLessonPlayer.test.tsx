import { render, screen, waitFor } from '@testing-library/react';
import { VimeoLessonPlayer } from './VimeoLessonPlayer';

vi.mock('next-intl', () => {
    const messages = require('../../../messages/th/learning.json') as {
        learning: {
            courseArea: Record<string, string>;
        };
    };

    return {
        useTranslations: (namespace?: string) => {
            const scopedMessages = namespace
                ? namespace.split('.').reduce<unknown>((acc, part) => {
                    if (!acc || typeof acc !== 'object') {
                        return undefined;
                    }

                    return (acc as Record<string, unknown>)[part];
                }, messages)
                : messages;

            return (key: string, values?: Record<string, unknown>) => {
                const template = typeof scopedMessages === 'object' && scopedMessages
                    ? (scopedMessages as Record<string, unknown>)[key]
                    : undefined;

                if (typeof template !== 'string') {
                    return key;
                }

                if (!values) {
                    return template;
                }

                return template.replace(/\{(\w+)\}/g, (_, token: string) => String(values[token] ?? `{${token}}`));
            };
        },
    };
});

const playerHarness = vi.hoisted(() => ({
    options: null as Record<string, unknown> | null,
    destroy: vi.fn().mockResolvedValue(undefined),
    setCurrentTime: vi.fn((seconds: number) => Promise.resolve(seconds)),
    getCurrentTime: vi.fn().mockResolvedValue(0),
    getDuration: vi.fn().mockResolvedValue(600),
    handlers: {} as Record<string, (payload?: { seconds?: number; duration?: number }) => void>,
}));

class MockVimeoPlayer {
    constructor(element: HTMLElement, options: Record<string, unknown>) {
        playerHarness.options = options;
        playerHarness.handlers = {};

        const iframe = document.createElement('iframe');
        iframe.setAttribute('title', 'mock-vimeo-surface');
        element.innerHTML = '';
        element.appendChild(iframe);
    }

    on(event: string, callback: (payload?: { seconds?: number; duration?: number }) => void) {
        playerHarness.handlers[event] = callback;
    }

    ready() {
        return Promise.resolve();
    }

    play() {
        return Promise.resolve();
    }

    pause() {
        return Promise.resolve();
    }

    destroy() {
        playerHarness.destroy();
        return Promise.resolve();
    }

    setCurrentTime(seconds: number) {
        playerHarness.setCurrentTime(seconds);
        return Promise.resolve(seconds);
    }

    getCurrentTime() {
        return playerHarness.getCurrentTime();
    }

    getDuration() {
        return playerHarness.getDuration();
    }
}

describe('VimeoLessonPlayer', () => {
    beforeEach(() => {
        window.__PHARMACY_TEST_VIMEO_PLAYER__ = MockVimeoPlayer as never;
        playerHarness.options = null;
        playerHarness.destroy.mockClear();
        playerHarness.setCurrentTime.mockClear();
        playerHarness.getCurrentTime.mockClear();
        playerHarness.getDuration.mockClear();
        playerHarness.handlers = {};
    });

    afterEach(() => {
        delete window.__PHARMACY_TEST_VIMEO_PLAYER__;
    });

    it('keeps the native Vimeo player UI interactive when seek validation is handled by runtime logic', async () => {
        render(
            <VimeoLessonPlayer
                playbackUrl="https://player.vimeo.com/video/1175386748?h=testhash"
                title="บทเรียนทดสอบ"
                onTimeUpdate={() => undefined}
                onSeeked={() => undefined}
                onPause={() => undefined}
                onEnded={() => undefined}
            />
        );

        await waitFor(() => {
            const configuredUrl = new URL(String(playerHarness.options?.url));
            expect(configuredUrl.origin + configuredUrl.pathname).toBe('https://player.vimeo.com/video/1175386748');
            expect(configuredUrl.searchParams.get('h')).toBe('testhash');
            expect(configuredUrl.searchParams.get('speed')).toBe('0');
            expect(configuredUrl.searchParams.get('cc')).toBe('0');
            expect(configuredUrl.searchParams.get('quality_selector')).toBe('1');
        });

        const iframe = document.querySelector('iframe');
        await waitFor(() => {
            expect(iframe).not.toBeNull();
            expect((iframe as HTMLIFrameElement).style.pointerEvents).toBe('');
            expect(iframe).not.toHaveAttribute('tabindex');
        });
        expect(screen.queryByTestId('vimeo-player-seek-guard')).not.toBeInTheDocument();
    });

    it('isolates iframe interaction only while the lesson modal is blocking the player', async () => {
        const { rerender } = render(
            <VimeoLessonPlayer
                playbackUrl="https://player.vimeo.com/video/1175386748?h=testhash"
                title="บทเรียนทดสอบ"
                interactionDisabled={false}
                onTimeUpdate={() => undefined}
                onSeeked={() => undefined}
                onPause={() => undefined}
                onEnded={() => undefined}
            />
        );

        const iframe = await waitFor(() => {
            const resolvedIframe = document.querySelector('iframe');
            expect(resolvedIframe).not.toBeNull();
            return resolvedIframe as HTMLIFrameElement;
        });

        expect(iframe.style.pointerEvents).toBe('');
        expect(iframe).not.toHaveAttribute('tabindex');

        rerender(
            <VimeoLessonPlayer
                playbackUrl="https://player.vimeo.com/video/1175386748?h=testhash"
                title="บทเรียนทดสอบ"
                interactionDisabled
                onTimeUpdate={() => undefined}
                onSeeked={() => undefined}
                onPause={() => undefined}
                onEnded={() => undefined}
            />
        );

        await waitFor(() => {
            const updatedIframe = document.querySelector('iframe') as HTMLIFrameElement | null;
            expect(updatedIframe).not.toBeNull();
            expect(updatedIframe?.style.pointerEvents).toBe('none');
            expect(updatedIframe).toHaveAttribute('tabindex', '-1');
            expect(updatedIframe).toHaveAttribute('aria-hidden', 'true');
        });
    });
});
