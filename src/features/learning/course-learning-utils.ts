import { ApiError } from '@/lib/api';
import type { LearningLessonData } from './types';

export type LoadCourseLearningMode = 'followServerCurrentLesson' | 'preserveSelectedLesson';
export type LessonSupplementTab = 'documents' | 'interactive';
export type LearningCourseAreaTranslator = (key: string, values?: Record<string, string | number | Date>) => string;

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, createTimeoutError: () => Error): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            reject(createTimeoutError());
        }, timeoutMs);

        promise.then(
            (value) => {
                window.clearTimeout(timeoutId);
                resolve(value);
            },
            (error) => {
                window.clearTimeout(timeoutId);
                reject(error);
            },
        );
    });
}

export function isUnauthorizedApiError(error: unknown) {
    return isApiError(error) && (error.statusCode === 401 || error.code === 'UNAUTHORIZED');
}

export function isForbiddenApiError(error: unknown) {
    return isApiError(error) && (
        error.statusCode === 403
        || error.code === 'FORBIDDEN'
        || error.code === 'COURSE_NOT_ENROLLED'
    );
}

export function getLessonErrorNotice(error: unknown, interactiveIncompleteMessage: string) {
    if (!isApiError(error)) {
        return null;
    }

    switch (error.code) {
        case 'INTERACTIVE_INCOMPLETE':
            return interactiveIncompleteMessage;
        case 'LESSON_VIDEO_INCOMPLETE':
        case 'LESSON_LOCKED':
        case 'LESSON_QUIZ_INCOMPLETE':
        case 'LESSON_QUIZ_ATTEMPTS_EXHAUSTED':
            return error.message;
        default:
            return null;
    }
}

export function getProgressSyncNotice(error: unknown) {
    if (!isApiError(error)) {
        return null;
    }

    switch (error.code) {
        case 'VIDEO_SKIP_NOT_ALLOWED':
        case 'LESSON_LOCKED':
            return error.message;
        default:
            return null;
    }
}

export function getLessonQuizAccessNotice(error: unknown) {
    if (!isApiError(error)) {
        return null;
    }

    switch (error.code) {
        case 'INTERACTIVE_INCOMPLETE':
        case 'LESSON_VIDEO_INCOMPLETE':
        case 'LESSON_LOCKED':
        case 'LESSON_QUIZ_ATTEMPTS_EXHAUSTED':
            return error.message;
        default:
            return null;
    }
}

export function findFirstAvailableLesson(lessons: LearningLessonData[]) {
    return lessons.find((lesson) => lesson.status !== 'locked') || lessons[0] || null;
}

export function resolveLessonSupplementTab(
    lesson: LearningLessonData | null,
    preferredTab: LessonSupplementTab,
): LessonSupplementTab {
    if (!lesson) {
        return 'documents';
    }

    if (preferredTab === 'documents' && lesson.documents.length > 0) {
        return 'documents';
    }

    if (preferredTab === 'interactive' && lesson.interactiveQuestions.length > 0) {
        return 'interactive';
    }

    if (lesson.documents.length > 0) {
        return 'documents';
    }

    if (lesson.interactiveQuestions.length > 0) {
        return 'interactive';
    }

    return preferredTab;
}

export function buildLessonVideoSyncSignature(lesson: LearningLessonData | null | undefined) {
    if (!lesson) {
        return '';
    }

    if (!lesson.video) {
        return `${lesson.id}:none`;
    }

    return [
        lesson.id,
        lesson.video.id,
        lesson.video.provider,
        lesson.video.resourceId,
        lesson.video.status,
        lesson.video.playbackUrl ?? '',
        Number(lesson.video.duration ?? 0),
    ].join(':');
}
