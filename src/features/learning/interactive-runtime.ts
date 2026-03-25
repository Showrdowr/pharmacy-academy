import type {
    LearningCourseData,
    LearningInteractiveQuestion,
    LearningLessonData,
    LearningLessonVideo,
} from './types';

export type InteractiveStatusTone = 'slate' | 'amber' | 'emerald' | 'sky';

export interface InteractiveRuntimeStatus {
    tone: InteractiveStatusTone;
    message: string;
}

type LearningCourseAreaTranslator = (key: string, values?: Record<string, string | number | Date>) => string;

interface InteractiveRuntimeStatusInput {
    lesson: LearningLessonData | null | undefined;
    activeQuestion: LearningInteractiveQuestion | null;
    answeredCount: number;
    currentTime: number;
    lessonNotice?: string;
    nextPendingInteractive?: LearningInteractiveQuestion | null;
}

export function formatDuration(seconds?: number | null) {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds || 0)));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function normalizePlaybackSecond(seconds?: number | null) {
    return Math.max(0, Math.floor(Number(seconds || 0)));
}

export function calculateWatchPercent(watchedSeconds?: number | null, duration?: number | null) {
    const normalizedDuration = Math.max(0, Number(duration || 0));
    if (normalizedDuration <= 0) {
        return 0;
    }

    const normalizedWatchedSeconds = Math.max(0, Number(watchedSeconds || 0));
    return Math.min(100, Number(((Math.min(normalizedWatchedSeconds, normalizedDuration) / normalizedDuration) * 100).toFixed(2)));
}

export function calculateCourseWatchPercent(
    course: LearningCourseData | null | undefined,
    options?: { activeLessonId?: number | null; currentTime?: number | null }
) {
    if (!course) {
        return 0;
    }

    let totalDuration = 0;
    let totalWatchedSeconds = 0;

    for (const lesson of course.lessons) {
        const duration = Math.max(0, Number(lesson.video?.duration ?? 0));
        if (duration <= 0) {
            continue;
        }

        totalDuration += duration;
        const baselineWatchedSeconds = lesson.status === 'completed'
            ? duration
            : Number(lesson.progress.lastWatchedSeconds ?? 0);
        const watchedSeconds = lesson.id === options?.activeLessonId
            ? Math.max(baselineWatchedSeconds, Number(options?.currentTime ?? 0))
            : baselineWatchedSeconds;

        totalWatchedSeconds += Math.min(duration, Math.max(0, watchedSeconds));
    }

    return calculateWatchPercent(totalWatchedSeconds, totalDuration);
}

export function sortInteractiveQuestions<T extends Pick<LearningInteractiveQuestion, 'displayAtSeconds' | 'sortOrder'>>(questions: T[]) {
    return [...questions].sort((left, right) => {
        const displayDelta = left.displayAtSeconds - right.displayAtSeconds;
        if (displayDelta !== 0) {
            return displayDelta;
        }

        return left.sortOrder - right.sortOrder;
    });
}

export function getNextPendingInteractive(
    lesson: LearningLessonData | null | undefined,
    answeredIds: Set<number>,
    currentTime: number
) {
    if (!lesson) {
        return null;
    }

    return sortInteractiveQuestions(lesson.interactiveQuestions)
        .find((question) => !answeredIds.has(question.id) && question.displayAtSeconds <= currentTime) || null;
}

export function canRenderLessonVideo(video?: LearningLessonVideo | null) {
    return video?.provider === 'VIMEO'
        && video.status === 'READY'
        && Number(video.duration ?? 0) > 0
        && Boolean(video.playbackUrl);
}

export function getVideoAvailabilityMessage(
    status: 'PROCESSING' | 'READY' | 'FAILED' | undefined,
    duration: number | undefined,
    t: LearningCourseAreaTranslator,
) {
    if (status === 'READY' && Number(duration ?? 0) <= 0) {
        return t('runtimeVideoProcessing');
    }

    switch (status) {
        case 'FAILED':
            return t('runtimeVideoFailed');
        case 'PROCESSING':
            return t('runtimeVideoProcessing');
        default:
            return t('runtimeVideoMissing');
    }
}

export function getInteractiveRuntimeStatus({
    lesson,
    activeQuestion,
    answeredCount,
    currentTime,
    lessonNotice,
    nextPendingInteractive,
}: InteractiveRuntimeStatusInput, t: LearningCourseAreaTranslator): InteractiveRuntimeStatus | null {
    if (!lesson) {
        return null;
    }

    const totalQuestions = lesson.interactiveQuestions.length;

    if (lessonNotice) {
        return { tone: 'amber', message: lessonNotice };
    }

    if (totalQuestions === 0) {
        return { tone: 'slate', message: t('runtimeNoInteractive') };
    }

    if (!canRenderLessonVideo(lesson.video)) {
        return {
            tone: 'amber',
            message: t('runtimeVideoNotReady'),
        };
    }

    if (activeQuestion) {
        return {
            tone: 'amber',
            message: t('runtimeWaitingForAnswer', { time: formatDuration(activeQuestion.displayAtSeconds) }),
        };
    }

    if (answeredCount >= totalQuestions) {
        return { tone: 'emerald', message: t('runtimeAllAnswered') };
    }

    if (nextPendingInteractive && currentTime >= nextPendingInteractive.displayAtSeconds) {
        return {
            tone: 'amber',
            message: t('runtimePendingTriggered', { time: formatDuration(nextPendingInteractive.displayAtSeconds) }),
        };
    }

    if (nextPendingInteractive) {
        return {
            tone: 'sky',
            message: t('runtimeNextQuestionAt', { time: formatDuration(nextPendingInteractive.displayAtSeconds) }),
        };
    }

    return { tone: 'slate', message: t('runtimePreparing') };
}
