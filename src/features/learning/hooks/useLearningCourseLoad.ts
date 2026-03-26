import { useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { mergeLearningCourseWithCache, readLearningProgressCache } from '../progress-cache';
import { learningApi } from '../services/learningApi';
import type { LearningCourseData, LearningLessonData } from '../types';
import {
    findFirstAvailableLesson,
    getApiErrorMessage,
    isUnauthorizedApiError,
    type LoadCourseLearningMode,
    type LearningCourseAreaTranslator,
} from '../course-learning-utils';

interface UseLearningCourseLoadArgs {
    courseId: number | null;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    progressCacheUserKey: string | number;
    pushRoute: (href: string) => void;
    t: LearningCourseAreaTranslator;
    setCourse: Dispatch<SetStateAction<LearningCourseData | null>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setPageError: Dispatch<SetStateAction<string>>;
    setActiveLessonId: Dispatch<SetStateAction<number | null>>;
    hydrateServerProgress: (lessons: LearningLessonData[]) => void;
    persistProgress: (lessonId: number, seconds: number, force?: boolean) => Promise<boolean>;
    resetVideoSyncState: () => void;
}

export function useLearningCourseLoad({
    courseId,
    isAuthenticated,
    isAuthLoading,
    progressCacheUserKey,
    pushRoute,
    t,
    setCourse,
    setIsLoading,
    setPageError,
    setActiveLessonId,
    hydrateServerProgress,
    persistProgress,
    resetVideoSyncState,
}: UseLearningCourseLoadArgs) {
    const loadCourseLearning = useCallback(async (options?: {
        preferredLessonId?: number | null;
        mode?: LoadCourseLearningMode;
    }) => {
        if (!courseId) {
            setPageError(t('missingCourseId'));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setPageError('');

        try {
            const learningData = await learningApi.getCourseLearning(courseId);
            resetVideoSyncState();
            hydrateServerProgress(learningData.lessons);

            const cachedProgress = readLearningProgressCache(progressCacheUserKey, courseId);
            const mergedLearning = mergeLearningCourseWithCache(learningData, cachedProgress);
            setCourse(mergedLearning.course);

            mergedLearning.pendingLessonSyncs.forEach((pendingSync) => {
                void persistProgress(pendingSync.lessonId, pendingSync.lastWatchedSeconds, true);
            });

            const selectedLesson = options?.mode === 'preserveSelectedLesson' && options.preferredLessonId
                ? mergedLearning.course.lessons.find((lesson) => (
                    lesson.id === options.preferredLessonId && lesson.status !== 'locked'
                ))
                : null;
            const serverLesson = mergedLearning.course.lessons.find((lesson) => (
                lesson.id === mergedLearning.course.currentLessonId && lesson.status !== 'locked'
            )) || mergedLearning.course.lessons.find((lesson) => (
                lesson.id === mergedLearning.course.lastAccessedLessonId && lesson.status !== 'locked'
            ));
            const fallbackLesson = serverLesson || findFirstAvailableLesson(mergedLearning.course.lessons);

            setActiveLessonId(selectedLesson?.id || fallbackLesson?.id || null);
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                pushRoute('/sign-in');
                return;
            }

            setPageError(getApiErrorMessage(error, t('loadFailed')));
        } finally {
            setIsLoading(false);
        }
    }, [
        courseId,
        hydrateServerProgress,
        persistProgress,
        progressCacheUserKey,
        pushRoute,
        resetVideoSyncState,
        setActiveLessonId,
        setCourse,
        setIsLoading,
        setPageError,
        t,
    ]);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        if (!isAuthenticated) {
            pushRoute('/sign-in');
            return;
        }

        void loadCourseLearning({ mode: 'followServerCurrentLesson' });
    }, [isAuthenticated, isAuthLoading, loadCourseLearning, pushRoute]);

    return {
        loadCourseLearning,
    };
}
