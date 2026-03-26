import { useCallback, useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { normalizePlaybackSecond } from '../interactive-runtime';
import { writeLearningProgressCache } from '../progress-cache';
import { learningApi } from '../services/learningApi';
import type { LearningCourseData, LearningLessonData } from '../types';
import type { VimeoLessonPlayerInstance } from '../components/VimeoLessonPlayer';
import { getProgressSyncNotice } from '../course-learning-utils';

const MAX_PROGRESS_SYNC_STEP_SECONDS = 25;
const SEEK_AHEAD_TOLERANCE_SECONDS = 2;
const NATURAL_PLAYBACK_GRACE_SECONDS = 2;

interface UseLessonProgressSyncArgs {
    courseId: number | null;
    progressCacheUserKey: string | number;
    activeLesson: LearningLessonData | null;
    shouldPersistOnPageLifecycle: boolean;
    seekBlockedMessage: string;
    setCourse: Dispatch<SetStateAction<LearningCourseData | null>>;
    setCurrentTime: Dispatch<SetStateAction<number>>;
    setLessonNotice: Dispatch<SetStateAction<string>>;
}

export function useLessonProgressSync({
    courseId,
    progressCacheUserKey,
    activeLesson,
    shouldPersistOnPageLifecycle,
    seekBlockedMessage,
    setCourse,
    setCurrentTime,
    setLessonNotice,
}: UseLessonProgressSyncArgs) {
    const playerRef = useRef<VimeoLessonPlayerInstance | null>(null);
    const activeLessonRef = useRef<LearningLessonData | null>(null);
    const currentTimeRef = useRef(0);
    const watchedSecondsByLessonRef = useRef(new Map<number, number>());
    const maxReachedSecondsByLessonRef = useRef(new Map<number, number>());
    const lastPlaybackObservationByLessonRef = useRef(new Map<number, { seconds: number; observedAt: number }>());
    const lastRequestedSecondsByLessonRef = useRef(new Map<number, number>());
    const progressRequestVersionByLessonRef = useRef(new Map<number, number>());
    const lastConfirmedProgressByLessonRef = useRef(new Map<number, number>());

    const hydrateServerProgress = useCallback((lessons: LearningLessonData[]) => {
        lessons.forEach((lesson) => {
            lastConfirmedProgressByLessonRef.current.set(
                lesson.id,
                normalizePlaybackSecond(lesson.progress.lastWatchedSeconds),
            );
        });
    }, []);

    const getTrackedLessonSeconds = useCallback((lessonId: number, fallbackSeconds = 0) => (
        watchedSecondsByLessonRef.current.get(lessonId)
        ?? normalizePlaybackSecond(fallbackSeconds)
    ), []);

    const getKnownMaxReachedSeconds = useCallback((lesson: LearningLessonData, fallbackSeconds = 0) => Math.max(
        maxReachedSecondsByLessonRef.current.get(lesson.id)
            ?? normalizePlaybackSecond(lesson.progress.lastWatchedSeconds || fallbackSeconds),
        0,
    ), []);

    const recordPlaybackObservation = useCallback((lessonId: number, seconds: number) => {
        lastPlaybackObservationByLessonRef.current.set(lessonId, {
            seconds,
            observedAt: Date.now(),
        });
    }, []);

    const syncPlaybackState = useCallback((lessonId: number, seconds: number, options?: { updateMaxReached?: boolean }) => {
        watchedSecondsByLessonRef.current.set(lessonId, seconds);
        currentTimeRef.current = seconds;
        setCurrentTime(seconds);
        recordPlaybackObservation(lessonId, seconds);

        if (options?.updateMaxReached) {
            maxReachedSecondsByLessonRef.current.set(
                lessonId,
                Math.max(maxReachedSecondsByLessonRef.current.get(lessonId) ?? 0, seconds),
            );
        }
    }, [recordPlaybackObservation, setCurrentTime]);

    const shouldTreatAsForwardSkip = useCallback((lesson: LearningLessonData, nextSeconds: number) => {
        const maxReachedSeconds = getKnownMaxReachedSeconds(lesson);
        if (nextSeconds <= maxReachedSeconds) {
            return false;
        }

        const lastObservation = lastPlaybackObservationByLessonRef.current.get(lesson.id);
        if (!lastObservation) {
            return nextSeconds > maxReachedSeconds + SEEK_AHEAD_TOLERANCE_SECONDS;
        }

        const elapsedSinceObservationSeconds = Math.max(
            0,
            (Date.now() - lastObservation.observedAt) / 1000,
        );
        const maxNaturalAdvanceSeconds = Math.max(
            maxReachedSeconds,
            lastObservation.seconds,
        ) + Math.max(
            SEEK_AHEAD_TOLERANCE_SECONDS,
            Math.ceil(elapsedSinceObservationSeconds) + NATURAL_PLAYBACK_GRACE_SECONDS,
        );

        return nextSeconds > maxNaturalAdvanceSeconds;
    }, [getKnownMaxReachedSeconds]);

    const rollbackForwardSeek = useCallback((lesson: LearningLessonData, attemptedSeconds: number) => {
        const rollbackSeconds = getKnownMaxReachedSeconds(lesson);
        syncPlaybackState(lesson.id, rollbackSeconds);
        setLessonNotice(seekBlockedMessage);

        void playerRef.current?.setCurrentTime(rollbackSeconds).catch(() => undefined);
        return rollbackSeconds;
    }, [getKnownMaxReachedSeconds, seekBlockedMessage, setLessonNotice, syncPlaybackState]);

    const persistProgress = useCallback(async (
        lessonId: number,
        seconds: number,
        force = false,
        options?: { keepalive?: boolean },
    ) => {
        const roundedSeconds = normalizePlaybackSecond(seconds);
        watchedSecondsByLessonRef.current.set(lessonId, roundedSeconds);
        if (courseId) {
            writeLearningProgressCache(
                progressCacheUserKey,
                courseId,
                lessonId,
                roundedSeconds,
                { lastAccessedLessonId: lessonId },
            );
        }

        const lastRequestedSeconds = lastRequestedSecondsByLessonRef.current.get(lessonId);
        if (!force && lastRequestedSeconds !== undefined && Math.abs(roundedSeconds - lastRequestedSeconds) < 5) {
            return true;
        }

        lastRequestedSecondsByLessonRef.current.set(lessonId, roundedSeconds);
        const requestVersion = (progressRequestVersionByLessonRef.current.get(lessonId) ?? 0) + 1;
        progressRequestVersionByLessonRef.current.set(lessonId, requestVersion);

        try {
            let latestProgressSeconds = -1;
            let latestProgressIsCompleted = false;
            let confirmedSeconds = normalizePlaybackSecond(
                lastConfirmedProgressByLessonRef.current.get(lessonId),
            );

            const syncProgressRequest = async (targetSeconds: number, requestOptions?: { keepalive?: boolean }) => {
                const progress = await learningApi.updateLessonProgress(
                    lessonId,
                    targetSeconds,
                    requestOptions?.keepalive ? { keepalive: true } : undefined,
                );
                if (progressRequestVersionByLessonRef.current.get(lessonId) !== requestVersion) {
                    return null;
                }

                const syncedSeconds = normalizePlaybackSecond(progress.lastWatchedSeconds);
                lastConfirmedProgressByLessonRef.current.set(lessonId, syncedSeconds);
                confirmedSeconds = syncedSeconds;
                latestProgressSeconds = syncedSeconds;
                latestProgressIsCompleted = progress.isCompleted;
                return progress;
            };

            while (!options?.keepalive && confirmedSeconds + MAX_PROGRESS_SYNC_STEP_SECONDS < roundedSeconds) {
                const previousConfirmedSeconds = confirmedSeconds;
                const chunkTargetSeconds = Math.min(
                    roundedSeconds,
                    confirmedSeconds + MAX_PROGRESS_SYNC_STEP_SECONDS,
                );
                const chunkProgress = await syncProgressRequest(chunkTargetSeconds);
                if (!chunkProgress) {
                    return false;
                }

                const chunkSyncedSeconds = normalizePlaybackSecond(chunkProgress.lastWatchedSeconds);
                if (chunkSyncedSeconds <= previousConfirmedSeconds) {
                    break;
                }
            }

            if (latestProgressSeconds < roundedSeconds) {
                const progress = await syncProgressRequest(
                    roundedSeconds,
                    options?.keepalive ? { keepalive: true } : undefined,
                );
                if (!progress) {
                    return false;
                }
            }

            if (latestProgressSeconds < 0) {
                return true;
            }

            if (courseId) {
                writeLearningProgressCache(
                    progressCacheUserKey,
                    courseId,
                    lessonId,
                    latestProgressSeconds,
                    { lastAccessedLessonId: lessonId },
                );
            }

            setCourse((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    lessons: current.lessons.map((item) =>
                        item.id === lessonId
                            ? {
                                ...item,
                                progress: {
                                    ...item.progress,
                                    lastWatchedSeconds: Math.max(
                                        Number(item.progress.lastWatchedSeconds ?? 0),
                                        latestProgressSeconds,
                                    ),
                                    isCompleted: latestProgressIsCompleted,
                                },
                            }
                            : item
                    ),
                };
            });
            return true;
        } catch (error) {
            lastRequestedSecondsByLessonRef.current.set(
                lessonId,
                normalizePlaybackSecond(lastConfirmedProgressByLessonRef.current.get(lessonId)),
            );
            const syncNotice = getProgressSyncNotice(error);
            if (syncNotice) {
                setLessonNotice(syncNotice);
            }
            return false;
        }
    }, [courseId, progressCacheUserKey, setCourse, setLessonNotice]);

    useEffect(() => {
        activeLessonRef.current = activeLesson;
    }, [activeLesson]);

    useEffect(() => {
        const lessonId = activeLesson?.id;

        return () => {
            if (!lessonId) {
                return;
            }

            const trackedSeconds = getTrackedLessonSeconds(
                lessonId,
                activeLesson?.progress.lastWatchedSeconds || 0,
            );
            void persistProgress(lessonId, trackedSeconds, true, { keepalive: true });
        };
    }, [activeLesson?.id, activeLesson?.progress.lastWatchedSeconds, getTrackedLessonSeconds, persistProgress]);

    useEffect(() => {
        if (!activeLesson || !shouldPersistOnPageLifecycle) {
            return;
        }

        const pausePlaybackWhenPageIsHidden = () => {
            const visibilityState = typeof document.visibilityState === 'string'
                ? document.visibilityState
                : (document.hidden ? 'hidden' : 'visible');
            if (visibilityState === 'visible') {
                return;
            }

            const trackedSeconds = getTrackedLessonSeconds(
                activeLesson.id,
                currentTimeRef.current || activeLesson.progress.lastWatchedSeconds || 0,
            );
            void playerRef.current?.pause().catch(() => undefined);
            void persistProgress(activeLesson.id, trackedSeconds, true, { keepalive: true });
        };

        const handlePageHide = () => {
            const trackedSeconds = getTrackedLessonSeconds(
                activeLesson.id,
                currentTimeRef.current || activeLesson.progress.lastWatchedSeconds || 0,
            );
            void playerRef.current?.pause().catch(() => undefined);
            void persistProgress(activeLesson.id, trackedSeconds, true, { keepalive: true });
        };

        const handleBeforeUnload = () => {
            const trackedSeconds = getTrackedLessonSeconds(
                activeLesson.id,
                currentTimeRef.current || activeLesson.progress.lastWatchedSeconds || 0,
            );
            void persistProgress(activeLesson.id, trackedSeconds, true, { keepalive: true });
        };

        document.addEventListener('visibilitychange', pausePlaybackWhenPageIsHidden);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', pausePlaybackWhenPageIsHidden);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [activeLesson, getTrackedLessonSeconds, persistProgress, shouldPersistOnPageLifecycle]);

    return {
        activeLessonRef,
        currentTimeRef,
        getKnownMaxReachedSeconds,
        getTrackedLessonSeconds,
        hydrateServerProgress,
        lastRequestedSecondsByLessonRef,
        maxReachedSecondsByLessonRef,
        persistProgress,
        playerRef: playerRef as MutableRefObject<VimeoLessonPlayerInstance | null>,
        recordPlaybackObservation,
        rollbackForwardSeek,
        shouldTreatAsForwardSkip,
        syncPlaybackState,
        watchedSecondsByLessonRef,
    };
}
