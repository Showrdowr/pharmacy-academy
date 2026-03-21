'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';

export type VimeoLessonPlayerInstance = {
    play: () => Promise<void>;
    pause: () => Promise<void>;
    destroy: () => Promise<void>;
    setCurrentTime: (seconds: number) => Promise<number>;
    getCurrentTime: () => Promise<number>;
    getDuration: () => Promise<number>;
};

type VimeoPlayerConstructor = new (
    element: HTMLElement,
    options: Record<string, unknown>
) => VimeoLessonPlayerInstance & {
    on: (event: string, callback: (payload?: { seconds?: number; duration?: number }) => void) => void;
    ready: () => Promise<void>;
};

declare global {
    interface Window {
        __PHARMACY_TEST_VIMEO_PLAYER__?: VimeoPlayerConstructor;
    }
}

interface VimeoLessonPlayerProps {
    playbackUrl: string;
    title: string;
    resumeAt?: number;
    disableForwardSeekUi?: boolean;
    interactionDisabled?: boolean;
    onReadyChange?: (ready: boolean) => void;
    onInitialTimeResolved?: (seconds: number) => void;
    onTimeUpdate: (seconds: number) => void;
    onSeeked: (seconds: number) => void;
    onPause: (seconds: number) => void;
    onEnded: () => void;
    onBlockedSeekControlInteraction?: () => void;
    playerRef?: MutableRefObject<VimeoLessonPlayerInstance | null>;
}

function normalizePlayerSecond(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
        return 0;
    }

    return Math.max(0, Math.floor(value));
}

export function VimeoLessonPlayer({
    playbackUrl,
    title,
    resumeAt = 0,
    disableForwardSeekUi = false,
    interactionDisabled = false,
    onReadyChange,
    onInitialTimeResolved,
    onTimeUpdate,
    onSeeked,
    onPause,
    onEnded,
    onBlockedSeekControlInteraction,
    playerRef,
}: VimeoLessonPlayerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const resumeAtRef = useRef(resumeAt);
    const onReadyChangeRef = useRef(onReadyChange);
    const onInitialTimeResolvedRef = useRef(onInitialTimeResolved);
    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onSeekedRef = useRef(onSeeked);
    const onPauseRef = useRef(onPause);
    const onEndedRef = useRef(onEnded);
    const onBlockedSeekControlInteractionRef = useRef(onBlockedSeekControlInteraction);
    const playerRefProp = useRef(playerRef);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { resumeAtRef.current = resumeAt; }, [resumeAt]);
    useEffect(() => { onReadyChangeRef.current = onReadyChange; }, [onReadyChange]);
    useEffect(() => { onInitialTimeResolvedRef.current = onInitialTimeResolved; }, [onInitialTimeResolved]);
    useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
    useEffect(() => { onSeekedRef.current = onSeeked; }, [onSeeked]);
    useEffect(() => { onPauseRef.current = onPause; }, [onPause]);
    useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
    useEffect(() => { onBlockedSeekControlInteractionRef.current = onBlockedSeekControlInteraction; }, [onBlockedSeekControlInteraction]);
    useEffect(() => { playerRefProp.current = playerRef; }, [playerRef]);

    useEffect(() => {
        if (!containerRef.current || typeof MutationObserver === 'undefined') {
            return;
        }

        const container = containerRef.current;

        const restoreIframeAttributes = () => {
            const iframes = Array.from(container.querySelectorAll<HTMLIFrameElement>('iframe'));
            iframes.forEach((iframe) => {
                const previousPointerEvents = iframe.dataset.prevPointerEvents ?? '';
                const previousTabIndex = iframe.dataset.prevTabIndex ?? '';
                const previousAriaHidden = iframe.dataset.prevAriaHidden ?? '';

                iframe.style.pointerEvents = previousPointerEvents;
                if (previousTabIndex) {
                    iframe.setAttribute('tabindex', previousTabIndex);
                } else {
                    iframe.removeAttribute('tabindex');
                }

                if (previousAriaHidden) {
                    iframe.setAttribute('aria-hidden', previousAriaHidden);
                } else {
                    iframe.removeAttribute('aria-hidden');
                }
            });
        };

        const applyIframeIsolation = (disabled: boolean) => {
            const iframes = Array.from(container.querySelectorAll<HTMLIFrameElement>('iframe'));
            iframes.forEach((iframe) => {
                if (!iframe.hasAttribute('data-prev-pointer-events')) {
                    iframe.dataset.prevPointerEvents = iframe.style.pointerEvents || '';
                }
                if (!iframe.hasAttribute('data-prev-tab-index')) {
                    iframe.dataset.prevTabIndex = iframe.getAttribute('tabindex') ?? '';
                }
                if (!iframe.hasAttribute('data-prev-aria-hidden')) {
                    iframe.dataset.prevAriaHidden = iframe.getAttribute('aria-hidden') ?? '';
                }

                if (disabled) {
                    iframe.style.pointerEvents = 'none';
                    iframe.setAttribute('tabindex', '-1');
                    iframe.setAttribute('aria-hidden', 'true');
                    return;
                }

                const previousPointerEvents = iframe.dataset.prevPointerEvents ?? '';
                const previousTabIndex = iframe.dataset.prevTabIndex ?? '';
                const previousAriaHidden = iframe.dataset.prevAriaHidden ?? '';

                iframe.style.pointerEvents = previousPointerEvents;
                if (previousTabIndex) {
                    iframe.setAttribute('tabindex', previousTabIndex);
                } else {
                    iframe.removeAttribute('tabindex');
                }

                if (previousAriaHidden) {
                    iframe.setAttribute('aria-hidden', previousAriaHidden);
                } else {
                    iframe.removeAttribute('aria-hidden');
                }

                delete iframe.dataset.prevPointerEvents;
                delete iframe.dataset.prevTabIndex;
                delete iframe.dataset.prevAriaHidden;
            });
        };

        applyIframeIsolation(interactionDisabled);
        const observer = new MutationObserver(() => {
            applyIframeIsolation(interactionDisabled);
        });
        observer.observe(container, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            restoreIframeAttributes();
        };
    }, [interactionDisabled, playbackUrl]);

    useEffect(() => {
        let destroyed = false;
        let playerInstance: VimeoLessonPlayerInstance | null = null;
        let timeoutId: number | null = null;

        const finishWithError = (message: string) => {
            if (destroyed) {
                return;
            }

            setError(message);
            setIsLoading(false);
            onReadyChangeRef.current?.(false);
            if (playerRefProp.current) {
                playerRefProp.current.current = null;
            }
        };

        setIsLoading(true);
        setError('');

        (async () => {
            try {
                const PlayerClass = window.__PHARMACY_TEST_VIMEO_PLAYER__
                    ?? (await import('@vimeo/player')).default as VimeoPlayerConstructor;
                if (destroyed || !containerRef.current) {
                    return;
                }

                const player = new PlayerClass(
                    containerRef.current,
                    {
                        url: playbackUrl,
                        dnt: true,
                        responsive: true,
                        title: false,
                        byline: false,
                        portrait: false,
                        keyboard: false,
                    } as any,
                ) as unknown as VimeoLessonPlayerInstance & {
                    on: (event: string, callback: (payload?: { seconds?: number; duration?: number }) => void) => void;
                    ready: () => Promise<void>;
                };

                timeoutId = window.setTimeout(() => {
                    finishWithError('Vimeo ใช้เวลาตอบสนองนานเกินไป กรุณาลองใหม่อีกครั้ง');
                }, 10000);

                player.on('error', () => {
                    finishWithError('ไม่สามารถโหลดวิดีโอนี้จาก Vimeo ได้');
                });

                player.on('timeupdate', (payload) => {
                    if (!destroyed) {
                        const resolvedSeconds = normalizePlayerSecond(Number(payload?.seconds || 0));
                        onTimeUpdateRef.current(resolvedSeconds);
                    }
                });

                player.on('seeked', (payload) => {
                    if (!destroyed) {
                        const resolvedSeconds = normalizePlayerSecond(Number(payload?.seconds || 0));
                        onSeekedRef.current(resolvedSeconds);
                    }
                });

                player.on('pause', (payload) => {
                    if (!destroyed) {
                        const resolvedSeconds = normalizePlayerSecond(Number(payload?.seconds || 0));
                        onPauseRef.current(resolvedSeconds);
                    }
                });

                player.on('ended', () => {
                    if (!destroyed) {
                        onEndedRef.current();
                    }
                });

                await player.ready();

                if (destroyed) {
                    return;
                }

                playerInstance = player;
                if (playerRefProp.current) {
                    playerRefProp.current.current = player;
                }
                onReadyChangeRef.current?.(true);

                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }
                setIsLoading(false);

                const normalizedResumeAt = Math.max(0, Math.floor(resumeAtRef.current || 0));
                let initialSeconds = normalizedResumeAt;
                if (normalizedResumeAt > 0) {
                    initialSeconds = await player.setCurrentTime(normalizedResumeAt).catch(() => normalizedResumeAt);
                }

                if (!destroyed) {
                    onInitialTimeResolvedRef.current?.(initialSeconds);
                }
            } catch {
                finishWithError('ไม่สามารถเริ่มต้น Vimeo player ได้');
            }
        })();

        return () => {
            destroyed = true;
            onReadyChangeRef.current?.(false);
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
            if (playerRefProp.current) {
                playerRefProp.current.current = null;
            }
            if (playerInstance) {
                void playerInstance.destroy().catch(() => undefined);
            }
        };
    }, [playbackUrl]);

    return (
        <div className="relative h-full w-full">
            <div ref={containerRef} className="h-full w-full" aria-label={title} />
            {disableForwardSeekUi && !interactionDisabled && (
                <div
                    className="absolute bottom-0 left-16 right-16 z-10 h-14 cursor-not-allowed bg-transparent sm:left-20 sm:right-20 sm:h-16"
                    aria-hidden="true"
                    data-testid="vimeo-player-seek-guard"
                    onClick={() => onBlockedSeekControlInteractionRef.current?.()}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onBlockedSeekControlInteractionRef.current?.();
                    }}
                    onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onBlockedSeekControlInteractionRef.current?.();
                    }}
                    onTouchStart={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onBlockedSeekControlInteractionRef.current?.();
                    }}
                />
            )}
            {interactionDisabled && (
                <div className="absolute inset-0 z-10" aria-hidden="true" data-testid="vimeo-player-interaction-blocker" />
            )}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 text-sm font-semibold text-white">
                    กำลังโหลดวิดีโอ...
                </div>
            )}
            {error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 px-6 text-center text-sm text-red-100">
                    <div className="max-w-md">
                        <div className="mb-3 flex justify-center">
                            <AlertCircle size={20} />
                        </div>
                        <p>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
