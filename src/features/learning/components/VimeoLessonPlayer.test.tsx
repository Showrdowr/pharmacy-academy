import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VimeoLessonPlayer } from './VimeoLessonPlayer';

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

    it('keeps the native Vimeo player UI but renders a seek guard in learner mode', async () => {
        const onBlockedSeekControlInteraction = vi.fn();

        render(
            <VimeoLessonPlayer
                playbackUrl="https://player.vimeo.com/video/1175386748?h=testhash"
                title="บทเรียนทดสอบ"
                disableForwardSeekUi
                onBlockedSeekControlInteraction={onBlockedSeekControlInteraction}
                onTimeUpdate={() => undefined}
                onSeeked={() => undefined}
                onPause={() => undefined}
                onEnded={() => undefined}
            />
        );

        await waitFor(() => {
            expect(playerHarness.options?.url).toBe('https://player.vimeo.com/video/1175386748?h=testhash');
        });

        const iframe = document.querySelector('iframe');
        await waitFor(() => {
            expect(iframe).not.toBeNull();
            expect((iframe as HTMLIFrameElement).style.pointerEvents).toBe('');
            expect(iframe).not.toHaveAttribute('tabindex');
        });

        const seekGuard = screen.getByTestId('vimeo-player-seek-guard');
        expect(seekGuard).toBeInTheDocument();

        fireEvent.pointerDown(seekGuard);
        expect(onBlockedSeekControlInteraction).toHaveBeenCalledTimes(1);
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
            expect(iframe.style.pointerEvents).toBe('none');
            expect(iframe).toHaveAttribute('tabindex', '-1');
            expect(iframe).toHaveAttribute('aria-hidden', 'true');
        });
    });
});
