import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { canRenderLessonVideo, getVideoAvailabilityMessage } from '../interactive-runtime';
import { learningApi } from '../services/learningApi';
import type { LearningCourseData, LearningLessonData, LearningLessonVideo } from '../types';
import { buildLessonVideoSyncSignature, getApiErrorMessage, type LearningCourseAreaTranslator } from '../course-learning-utils';

interface UseLessonVideoSyncArgs {
    courseId: number | null;
    activeLesson: LearningLessonData | null;
    setCourse: Dispatch<SetStateAction<LearningCourseData | null>>;
    playerLoadFailedMessage: string;
    t: LearningCourseAreaTranslator;
}

function buildSyncedVideoSignature(lessonId: number, video: LearningLessonVideo | null) {
    if (!video) {
        return `${lessonId}:none`;
    }

    return [
        lessonId,
        video.id,
        video.provider,
        video.resourceId,
        video.status,
        video.playbackUrl ?? '',
        Number(video.duration ?? 0),
    ].join(':');
}

export function useLessonVideoSync({
    courseId,
    activeLesson,
    setCourse,
    playerLoadFailedMessage,
    t,
}: UseLessonVideoSyncArgs) {
    const [videoSyncingLessonId, setVideoSyncingLessonId] = useState<number | null>(null);
    const [videoSyncErrorByLessonId, setVideoSyncErrorByLessonId] = useState<Record<number, string>>({});
    const [videoSyncSignatureByLessonId, setVideoSyncSignatureByLessonId] = useState<Record<number, string>>({});

    const updateLessonVideoState = useCallback((lessonId: number, video: LearningLessonVideo | null) => {
        setCourse((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                lessons: current.lessons.map((lesson) => (
                    lesson.id === lessonId
                        ? {
                            ...lesson,
                            video,
                        }
                        : lesson
                )),
            };
        });
    }, [setCourse]);

    const resetVideoSyncState = useCallback(() => {
        setVideoSyncErrorByLessonId({});
        setVideoSyncingLessonId(null);
        setVideoSyncSignatureByLessonId({});
    }, []);

    const activeLessonVideo = activeLesson?.video ?? null;
    const activeLessonVideoSyncError = activeLesson ? videoSyncErrorByLessonId[activeLesson.id] ?? '' : '';
    const isActiveLessonVideoSyncing = activeLesson?.id === videoSyncingLessonId;
    const syncLessonVideoStatus = (learningApi as Partial<typeof learningApi>).syncLessonVideoStatus;
    const canSyncActiveLessonVideoStatus = typeof syncLessonVideoStatus === 'function';
    const activeLessonVideoSyncSignature = buildLessonVideoSyncSignature(activeLesson);
    const hasActiveLessonVideoSynced = !activeLesson?.video
        || activeLesson.video.provider !== 'VIMEO'
        || !canSyncActiveLessonVideoStatus
        || videoSyncSignatureByLessonId[activeLesson.id] === activeLessonVideoSyncSignature;
    const isActiveLessonVideoPendingSync = Boolean(activeLesson?.video?.provider === 'VIMEO' && !hasActiveLessonVideoSynced);

    const playableVideo = useMemo(() => (
        !isActiveLessonVideoPendingSync
        && !isActiveLessonVideoSyncing
        && !activeLessonVideoSyncError
        && canRenderLessonVideo(activeLessonVideo)
            ? activeLessonVideo
            : null
    ), [
        activeLessonVideo,
        activeLessonVideoSyncError,
        isActiveLessonVideoPendingSync,
        isActiveLessonVideoSyncing,
    ]);

    const activeLessonVideoAvailabilityMessage = isActiveLessonVideoPendingSync || isActiveLessonVideoSyncing
        ? t('playerLoading')
        : activeLessonVideoSyncError || getVideoAvailabilityMessage(activeLesson?.video?.status, activeLesson?.video?.duration, t);

    useEffect(() => {
        if (!courseId || !activeLesson || !activeLesson.video || activeLesson.video.provider !== 'VIMEO') {
            return;
        }

        if (typeof syncLessonVideoStatus !== 'function') {
            return;
        }

        const lessonId = activeLesson.id;
        const currentSignature = buildLessonVideoSyncSignature(activeLesson);
        if (videoSyncSignatureByLessonId[lessonId] === currentSignature) {
            return;
        }

        let cancelled = false;
        setVideoSyncingLessonId(lessonId);
        setVideoSyncErrorByLessonId((current) => {
            if (!current[lessonId]) {
                return current;
            }

            const next = { ...current };
            delete next[lessonId];
            return next;
        });

        void (async () => {
            try {
                const result = await syncLessonVideoStatus(courseId, lessonId);
                if (cancelled) {
                    return;
                }

                updateLessonVideoState(lessonId, result.video);
                setVideoSyncSignatureByLessonId((current) => ({
                    ...current,
                    [lessonId]: buildSyncedVideoSignature(lessonId, result.video),
                }));
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setVideoSyncErrorByLessonId((current) => ({
                    ...current,
                    [lessonId]: getApiErrorMessage(error, playerLoadFailedMessage),
                }));
            } finally {
                if (!cancelled) {
                    setVideoSyncingLessonId((current) => current === lessonId ? null : current);
                }
            }
        })();

        return () => {
            cancelled = true;
            setVideoSyncingLessonId((current) => current === lessonId ? null : current);
        };
    }, [
        activeLesson,
        courseId,
        playerLoadFailedMessage,
        syncLessonVideoStatus,
        updateLessonVideoState,
        videoSyncSignatureByLessonId,
    ]);

    return {
        activeLessonVideo,
        activeLessonVideoAvailabilityMessage,
        activeLessonVideoSyncError,
        isActiveLessonVideoPendingSync,
        isActiveLessonVideoSyncing,
        playableVideo,
        resetVideoSyncState,
    };
}
