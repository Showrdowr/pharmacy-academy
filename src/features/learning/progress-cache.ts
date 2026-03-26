import { calculateCourseWatchPercent, normalizePlaybackSecond } from './interactive-runtime';
import type { LearningCourseData } from './types';

const LEARNING_PROGRESS_CACHE_PREFIX = 'pharmacy-learning-progress';
const LEARNING_PROGRESS_CACHE_VERSION = 1;

type LearningProgressUserKey = string | number | null | undefined;

interface CachedLessonProgress {
    lastWatchedSeconds: number;
    updatedAt: number;
}

interface LearningProgressCacheRecord {
    version: number;
    courseId: number;
    lastAccessedLessonId: number | null;
    updatedAt: number;
    lessons: Record<string, CachedLessonProgress>;
}

export interface PendingLessonProgressSync {
    lessonId: number;
    lastWatchedSeconds: number;
}

export interface MergedLearningCourseResult {
    course: LearningCourseData;
    pendingLessonSyncs: PendingLessonProgressSync[];
}

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeUserKey(userKey: LearningProgressUserKey) {
    if (typeof userKey === 'number' && Number.isFinite(userKey)) {
        return String(userKey);
    }

    if (typeof userKey === 'string' && userKey.trim()) {
        return userKey.trim();
    }

    return 'anonymous';
}

export function buildLearningProgressCacheKey(userKey: LearningProgressUserKey, courseId: number) {
    return `${LEARNING_PROGRESS_CACHE_PREFIX}:${normalizeUserKey(userKey)}:${courseId}`;
}

export function clearLearningProgressCache() {
    if (!canUseStorage()) {
        return;
    }

    try {
        const keysToRemove: string[] = [];
        for (let index = 0; index < window.localStorage.length; index += 1) {
            const storageKey = window.localStorage.key(index);
            if (storageKey?.startsWith(`${LEARNING_PROGRESS_CACHE_PREFIX}:`)) {
                keysToRemove.push(storageKey);
            }
        }

        keysToRemove.forEach((storageKey) => {
            window.localStorage.removeItem(storageKey);
        });
    } catch {
        // Ignore storage failures and continue clearing auth state.
    }
}

export function readLearningProgressCache(userKey: LearningProgressUserKey, courseId: number) {
    if (!canUseStorage() || !Number.isInteger(courseId) || courseId <= 0) {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(buildLearningProgressCacheKey(userKey, courseId));
        if (!rawValue) {
            return null;
        }

        const parsed = JSON.parse(rawValue) as Partial<LearningProgressCacheRecord>;
        if (
            parsed.version !== LEARNING_PROGRESS_CACHE_VERSION
            || Number(parsed.courseId) !== courseId
            || !parsed.lessons
            || typeof parsed.lessons !== 'object'
        ) {
            return null;
        }

        return {
            version: LEARNING_PROGRESS_CACHE_VERSION,
            courseId,
            lastAccessedLessonId: Number.isInteger(Number(parsed.lastAccessedLessonId))
                ? Number(parsed.lastAccessedLessonId)
                : null,
            updatedAt: Number(parsed.updatedAt ?? 0) || 0,
            lessons: Object.fromEntries(
                Object.entries(parsed.lessons).map(([lessonId, progress]) => {
                    const cachedProgress = progress as Partial<CachedLessonProgress> | null | undefined;
                    return [
                        lessonId,
                        {
                            lastWatchedSeconds: normalizePlaybackSecond(cachedProgress?.lastWatchedSeconds),
                            updatedAt: Number(cachedProgress?.updatedAt ?? 0) || 0,
                        },
                    ];
                }),
            ),
        } satisfies LearningProgressCacheRecord;
    } catch {
        return null;
    }
}

export function writeLearningProgressCache(
    userKey: LearningProgressUserKey,
    courseId: number,
    lessonId: number,
    lastWatchedSeconds: number,
    options?: { lastAccessedLessonId?: number | null },
) {
    if (!canUseStorage() || !Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(lessonId) || lessonId <= 0) {
        return;
    }

    const now = Date.now();
    const currentCache = readLearningProgressCache(userKey, courseId);
    const normalizedSeconds = normalizePlaybackSecond(lastWatchedSeconds);
    const lessonCacheKey = String(lessonId);
    const previousLessonProgress = currentCache?.lessons[lessonCacheKey];
    const nextLastAccessedLessonId = Number.isInteger(Number(options?.lastAccessedLessonId))
        ? Number(options?.lastAccessedLessonId)
        : lessonId;

    const nextCache: LearningProgressCacheRecord = {
        version: LEARNING_PROGRESS_CACHE_VERSION,
        courseId,
        lastAccessedLessonId: nextLastAccessedLessonId > 0 ? nextLastAccessedLessonId : null,
        updatedAt: now,
        lessons: {
            ...(currentCache?.lessons ?? {}),
            [lessonCacheKey]: {
                lastWatchedSeconds: Math.max(previousLessonProgress?.lastWatchedSeconds ?? 0, normalizedSeconds),
                updatedAt: now,
            },
        },
    };

    try {
        window.localStorage.setItem(
            buildLearningProgressCacheKey(userKey, courseId),
            JSON.stringify(nextCache),
        );
    } catch {
        // Ignore storage failures and continue with server-backed progress only.
    }
}

export function mergeLearningCourseWithCache(
    course: LearningCourseData,
    cache: ReturnType<typeof readLearningProgressCache>,
) {
    if (!cache) {
        return {
            course,
            pendingLessonSyncs: [],
        } satisfies MergedLearningCourseResult;
    }

    const pendingLessonSyncs: PendingLessonProgressSync[] = [];

    const mergedLessons = course.lessons.map((lesson) => {
        const cachedProgress = cache.lessons[String(lesson.id)];
        if (!cachedProgress) {
            return lesson;
        }

        const cachedWatchedSeconds = normalizePlaybackSecond(cachedProgress.lastWatchedSeconds);
        const serverWatchedSeconds = normalizePlaybackSecond(lesson.progress.lastWatchedSeconds);

        if (cachedWatchedSeconds <= serverWatchedSeconds) {
            return lesson;
        }

        pendingLessonSyncs.push({
            lessonId: lesson.id,
            lastWatchedSeconds: cachedWatchedSeconds,
        });

        return {
            ...lesson,
            progress: {
                ...lesson.progress,
                lastWatchedSeconds: cachedWatchedSeconds,
            },
        };
    });

    const cachedLastAccessedLessonId = Number(cache.lastAccessedLessonId ?? 0);
    const serverLastAccessedAt = Date.parse(course.lastAccessedAt || '');
    const hasFreshCachedSelection = cache.updatedAt > 0 && (
        !Number.isFinite(serverLastAccessedAt) || cache.updatedAt > serverLastAccessedAt
    );
    const hasAccessibleServerCurrentLesson = mergedLessons.some((lesson) => (
        lesson.id === course.currentLessonId && lesson.status !== 'locked'
    ));
    const shouldUseCachedLastAccessedLesson = Number.isInteger(cachedLastAccessedLessonId)
        && cachedLastAccessedLessonId > 0
        && mergedLessons.some((lesson) => lesson.id === cachedLastAccessedLessonId && lesson.status !== 'locked')
        && (!hasAccessibleServerCurrentLesson || hasFreshCachedSelection);

    const nextLastAccessedLessonId = shouldUseCachedLastAccessedLesson
        ? cachedLastAccessedLessonId
        : course.lastAccessedLessonId ?? null;
    const nextCurrentLessonId = shouldUseCachedLastAccessedLesson
        ? mergedLessons.find((lesson) => lesson.id === nextLastAccessedLessonId && lesson.status !== 'locked')?.id
        : mergedLessons.find((lesson) => lesson.id === course.currentLessonId && lesson.status !== 'locked')?.id
            ?? mergedLessons.find((lesson) => lesson.id === nextLastAccessedLessonId && lesson.status !== 'locked')?.id
        ?? null;

    if (
        shouldUseCachedLastAccessedLesson
        && cachedLastAccessedLessonId !== Number(course.lastAccessedLessonId ?? 0)
        && !pendingLessonSyncs.some((pendingSync) => pendingSync.lessonId === cachedLastAccessedLessonId)
    ) {
        const cachedLessonProgress = cache.lessons[String(cachedLastAccessedLessonId)];
        pendingLessonSyncs.push({
            lessonId: cachedLastAccessedLessonId,
            lastWatchedSeconds: normalizePlaybackSecond(cachedLessonProgress?.lastWatchedSeconds),
        });
    }

    const mergedCourse: LearningCourseData = {
        ...course,
        lessons: mergedLessons,
        lastAccessedLessonId: nextLastAccessedLessonId,
        currentLessonId: nextCurrentLessonId,
    };

    return {
        course: {
            ...mergedCourse,
            watchPercent: Math.max(
                Number(course.watchPercent ?? 0),
                calculateCourseWatchPercent(mergedCourse),
            ),
        },
        pendingLessonSyncs,
    } satisfies MergedLearningCourseResult;
}
