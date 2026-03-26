import { useCallback, useEffect, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { ApiError } from '@/lib/api';
import { canRenderLessonVideo, normalizePlaybackSecond } from '../interactive-runtime';
import { learningApi } from '../services/learningApi';
import type {
    LearningCourseData,
    LearningLessonData,
    LearningLessonQuizAttemptResult,
    LearningLessonQuizRuntime,
} from '../types';
import {
    getApiErrorMessage,
    getLessonQuizAccessNotice,
    isUnauthorizedApiError,
    type LearningCourseAreaTranslator,
    withTimeout,
} from '../course-learning-utils';

interface UseLessonQuizFlowArgs {
    activeLesson: LearningLessonData | null;
    currentTimeRef: MutableRefObject<number>;
    watchedSecondsByLessonRef: MutableRefObject<Map<number, number>>;
    roundedActiveLessonWatchPercent: number;
    hasPendingInteractive: boolean;
    persistProgress: (lessonId: number, seconds: number, force?: boolean) => Promise<boolean>;
    pushRoute: (href: string) => void;
    t: LearningCourseAreaTranslator;
    setCourse: Dispatch<SetStateAction<LearningCourseData | null>>;
    setLessonNotice: Dispatch<SetStateAction<string>>;
}

export function useLessonQuizFlow({
    activeLesson,
    currentTimeRef,
    watchedSecondsByLessonRef,
    roundedActiveLessonWatchPercent,
    hasPendingInteractive,
    persistProgress,
    pushRoute,
    t,
    setCourse,
    setLessonNotice,
}: UseLessonQuizFlowArgs) {
    const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [isQuizSubmitting, setIsQuizSubmitting] = useState(false);
    const [lessonQuizRuntime, setLessonQuizRuntime] = useState<LearningLessonQuizRuntime | null>(null);
    const [lessonQuizAnswers, setLessonQuizAnswers] = useState<Record<number, string>>({});
    const [lessonQuizError, setLessonQuizError] = useState('');
    const [lessonQuizResult, setLessonQuizResult] = useState<LearningLessonQuizAttemptResult | null>(null);

    const activeLessonQuiz = activeLesson?.lessonQuiz ?? null;
    const isLessonQuizPassed = Boolean(activeLessonQuiz?.latestAttempt?.isPassed);
    const isLessonQuizExhausted = Boolean(
        activeLessonQuiz
        && !activeLessonQuiz.latestAttempt?.isPassed
        && activeLessonQuiz.remainingAttempts !== null
        && activeLessonQuiz.remainingAttempts !== undefined
        && activeLessonQuiz.remainingAttempts <= 0
    );
    const isLessonQuizReady = Boolean(
        activeLesson
        && canRenderLessonVideo(activeLesson.video)
        && roundedActiveLessonWatchPercent >= 100
        && !hasPendingInteractive
    );

    useEffect(() => {
        setIsQuizPanelOpen(false);
        setIsQuizLoading(false);
        setIsQuizSubmitting(false);
        setLessonQuizRuntime(null);
        setLessonQuizAnswers({});
        setLessonQuizError('');
        setLessonQuizResult(null);
    }, [activeLesson?.id]);

    const handleOpenLessonQuiz = useCallback(async () => {
        if (!activeLesson || !activeLesson.lessonQuiz) {
            return;
        }

        if (isLessonQuizExhausted) {
            setLessonNotice(t('quizAttemptsExhaustedNotice'));
            return;
        }

        if (!isLessonQuizReady) {
            setLessonNotice(
                roundedActiveLessonWatchPercent < 100
                    ? t('quizFinishLessonFirst')
                    : t('quizInteractiveRequiredBeforeStart'),
            );
            return;
        }

        setLessonNotice('');
        setLessonQuizError('');
        setLessonQuizResult(null);

        if (lessonQuizRuntime && lessonQuizRuntime.lessonId === activeLesson.id) {
            setIsQuizPanelOpen(true);
            return;
        }

        setIsQuizLoading(true);
        const trackedSeconds = watchedSecondsByLessonRef.current.get(activeLesson.id)
            ?? normalizePlaybackSecond(currentTimeRef.current || activeLesson.progress.lastWatchedSeconds || 0);
        const syncSuccess = await persistProgress(activeLesson.id, trackedSeconds, true);
        if (!syncSuccess) {
            setLessonNotice((current) => current || t('quizProgressSyncFailed'));
            setIsQuizLoading(false);
            return;
        }

        setIsQuizPanelOpen(true);

        try {
            const quizRuntime = await withTimeout(
                learningApi.getLessonQuizRuntime(activeLesson.id),
                15_000,
                () => new ApiError(t('quizLoadFailed'), {
                    statusCode: 408,
                    code: 'REQUEST_TIMEOUT',
                }),
            );
            setLessonQuizRuntime(quizRuntime);
            setLessonQuizAnswers({});
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                pushRoute('/sign-in');
                return;
            }

            const lessonQuizAccessNotice = getLessonQuizAccessNotice(error);
            if (lessonQuizAccessNotice) {
                setIsQuizPanelOpen(false);
                setLessonNotice(lessonQuizAccessNotice);
                return;
            }

            setLessonQuizError(getApiErrorMessage(error, t('quizLoadFailed')));
        } finally {
            setIsQuizLoading(false);
        }
    }, [
        activeLesson,
        currentTimeRef,
        isLessonQuizExhausted,
        isLessonQuizReady,
        lessonQuizRuntime,
        persistProgress,
        pushRoute,
        roundedActiveLessonWatchPercent,
        setLessonNotice,
        t,
        watchedSecondsByLessonRef,
    ]);

    const handleLessonQuizAnswerChange = useCallback((questionId: number, answerGiven: string) => {
        setLessonQuizAnswers((current) => ({
            ...current,
            [questionId]: answerGiven,
        }));
    }, []);

    const handleSubmitLessonQuiz = useCallback(async () => {
        if (!activeLesson || !lessonQuizRuntime) {
            return;
        }

        const answers = lessonQuizRuntime.questions.map((question) => ({
            questionId: question.id,
            answerGiven: (lessonQuizAnswers[question.id] ?? '').trim(),
        }));

        if (answers.some((answer) => !answer.answerGiven)) {
            setLessonQuizError(t('quizAnswerRequired'));
            return;
        }

        setIsQuizSubmitting(true);
        setLessonQuizError('');
        setLessonNotice('');

        try {
            const attempt = await learningApi.submitLessonQuizAttempt(activeLesson.id, answers);

            setLessonQuizResult(attempt);
            setLessonQuizAnswers({});
            setIsQuizPanelOpen(false);
            setLessonNotice(
                attempt.isPassed
                    ? t('quizPassedReadyToComplete')
                    : attempt.remainingAttempts === null || attempt.remainingAttempts === undefined
                        ? t('quizRetryUnlimitedNotice')
                    : attempt.remainingAttempts > 0
                        ? t('quizRetryNotice', { count: attempt.remainingAttempts })
                        : t('quizAttemptsExhaustedNotice'),
            );

            setLessonQuizRuntime((current) => current && current.lessonId === activeLesson.id
                ? {
                    ...current,
                    attemptsUsed: attempt.attemptsUsed,
                    remainingAttempts: attempt.remainingAttempts ?? null,
                    latestAttempt: {
                        id: attempt.attemptId,
                        attemptNumber: attempt.attemptNumber,
                        scoreObtained: attempt.scoreObtained,
                        totalScore: attempt.totalScore,
                        scorePercent: attempt.scorePercent,
                        isPassed: attempt.isPassed,
                        finishedAt: attempt.finishedAt ?? null,
                    },
                }
                : current
            );

            setCourse((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    lessons: current.lessons.map((lesson) => {
                        if (lesson.id !== activeLesson.id || !lesson.lessonQuiz) {
                            return lesson;
                        }

                        return {
                            ...lesson,
                            lessonQuiz: {
                                ...lesson.lessonQuiz,
                                attemptsUsed: attempt.attemptsUsed,
                                remainingAttempts: attempt.remainingAttempts ?? null,
                                latestAttempt: {
                                    id: attempt.attemptId,
                                    attemptNumber: attempt.attemptNumber,
                                    scoreObtained: attempt.scoreObtained,
                                    totalScore: attempt.totalScore,
                                    scorePercent: attempt.scorePercent,
                                    isPassed: attempt.isPassed,
                                    finishedAt: attempt.finishedAt ?? null,
                                },
                            },
                        };
                    }),
                };
            });
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                pushRoute('/sign-in');
                return;
            }

            const lessonQuizAccessNotice = getLessonQuizAccessNotice(error);
            if (lessonQuizAccessNotice) {
                setLessonNotice(lessonQuizAccessNotice);
                setIsQuizPanelOpen(false);
                return;
            }

            setLessonQuizError(getApiErrorMessage(error, t('quizSubmitFailed')));
        } finally {
            setIsQuizSubmitting(false);
        }
    }, [
        activeLesson,
        lessonQuizAnswers,
        lessonQuizRuntime,
        pushRoute,
        setCourse,
        setLessonNotice,
        t,
    ]);

    return {
        activeLessonQuiz,
        handleLessonQuizAnswerChange,
        handleOpenLessonQuiz,
        handleSubmitLessonQuiz,
        isLessonQuizExhausted,
        isLessonQuizPassed,
        isLessonQuizReady,
        isQuizLoading,
        isQuizPanelOpen,
        isQuizSubmitting,
        lessonQuizAnswers,
        lessonQuizError,
        lessonQuizResult,
        lessonQuizRuntime,
        setIsQuizPanelOpen,
    };
}
