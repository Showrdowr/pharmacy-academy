'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    Eye,
    FileText,
    Flame,
    LockKeyhole,
    Medal,
    PlayCircle,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/lib/api';
import {
    calculateCourseWatchPercent,
    calculateWatchPercent,
    canRenderLessonVideo,
    formatDuration,
    getNextPendingInteractive,
    getVideoAvailabilityMessage,
    normalizePlaybackSecond,
} from '../interactive-runtime';
import { learningApi } from '../services/learningApi';
import { InteractivePromptModal } from './InteractivePromptModal';
import { VimeoLessonPlayer, type VimeoLessonPlayerInstance } from './VimeoLessonPlayer';
import { formatLocaleDate, useAppLocale } from '@/features/i18n';
import type {
    LearningCourseData,
    LearningInteractiveQuestion,
    LearningLessonData,
    LearningLessonDocument,
    LearningLessonQuizAttemptResult,
    LearningLessonQuizRuntime,
    LearningQuestionType,
} from '../types';

function formatFileSize(sizeBytes?: number | null) {
    const value = Number(sizeBytes || 0);
    if (value <= 0) {
        return '-';
    }

    if (value >= 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function parseCourseId(value: string | null) {
    const courseId = Number(value);
    return Number.isInteger(courseId) && courseId > 0 ? courseId : null;
}

function isDataUrl(value?: string | null) {
    return typeof value === 'string' && value.startsWith('data:');
}

type LoadCourseLearningMode = 'followServerCurrentLesson' | 'preserveSelectedLesson';
type LessonSupplementTab = 'documents' | 'interactive';

function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function isUnauthorizedApiError(error: unknown) {
    return isApiError(error) && (error.statusCode === 401 || error.code === 'UNAUTHORIZED');
}

function isForbiddenApiError(error: unknown) {
    return isApiError(error) && (
        error.statusCode === 403
        || error.code === 'FORBIDDEN'
        || error.code === 'COURSE_NOT_ENROLLED'
    );
}

function getLessonErrorNotice(error: unknown, interactiveIncompleteMessage: string) {
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

function getProgressSyncNotice(error: unknown) {
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

function findFirstAvailableLesson(lessons: LearningLessonData[]) {
    return lessons.find((lesson) => lesson.status !== 'locked') || lessons[0] || null;
}

function resolveLessonSupplementTab(
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

function logInteractiveDebug(event: string, payload?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    console.info('[interactive]', event, payload || {});
}

type LearningCourseAreaTranslator = (key: string, values?: Record<string, string | number | Date>) => string;

function getInteractiveQuestionTypeLabel(
    questionType: LearningQuestionType,
    t: LearningCourseAreaTranslator,
) {
    switch (questionType) {
        case 'MULTIPLE_CHOICE':
            return t('questionTypeMultipleChoice');
        case 'TRUE_FALSE':
            return t('questionTypeTrueFalse');
        case 'SHORT_ANSWER':
            return t('questionTypeShortAnswer');
        default:
            return questionType;
    }
}

function getLessonQuizAccessNotice(error: unknown) {
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

const CourseLearningArea = () => {
    const SEEK_AHEAD_TOLERANCE_SECONDS = 2;
    const NATURAL_PLAYBACK_GRACE_SECONDS = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useAppLocale();
    const t = useTranslations('learning.courseArea');
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [course, setCourse] = useState<LearningCourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeQuestion, setActiveQuestion] = useState<LearningInteractiveQuestion | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState('');
    const [writtenAnswer, setWrittenAnswer] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [lessonNotice, setLessonNotice] = useState('');
    const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);
    const [isCompletingLesson, setIsCompletingLesson] = useState(false);
    const [selectedSupplementTab, setSelectedSupplementTab] = useState<LessonSupplementTab>('documents');
    const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [isQuizSubmitting, setIsQuizSubmitting] = useState(false);
    const [lessonQuizRuntime, setLessonQuizRuntime] = useState<LearningLessonQuizRuntime | null>(null);
    const [lessonQuizAnswers, setLessonQuizAnswers] = useState<Record<number, string>>({});
    const [lessonQuizError, setLessonQuizError] = useState('');
    const [lessonQuizResult, setLessonQuizResult] = useState<LearningLessonQuizAttemptResult | null>(null);

    const playerRef = useRef<VimeoLessonPlayerInstance | null>(null);
    const activeLessonRef = useRef<LearningLessonData | null>(null);
    const currentTimeRef = useRef(0);
    const activeQuestionIdRef = useRef<number | null>(null);
    const answeredIdsRef = useRef<Set<number>>(new Set());
    const watchedSecondsByLessonRef = useRef(new Map<number, number>());
    const maxReachedSecondsByLessonRef = useRef(new Map<number, number>());
    const lastPlaybackObservationByLessonRef = useRef(new Map<number, { seconds: number; observedAt: number }>());
    const lastRequestedSecondsByLessonRef = useRef(new Map<number, number>());
    const progressRequestVersionByLessonRef = useRef(new Map<number, number>());

    const courseId = parseCourseId(searchParams.get('courseId') || searchParams.get('id'));

    const activeLesson = useMemo(
        () => course?.lessons.find((lesson) => lesson.id === activeLessonId) || null,
        [course, activeLessonId]
    );
    const activeLessonQuiz = activeLesson?.lessonQuiz ?? null;
    const isLessonQuizPassed = Boolean(activeLessonQuiz?.latestAttempt?.isPassed);
    const isLessonQuizExhausted = Boolean(
        activeLessonQuiz
        && !activeLessonQuiz.latestAttempt?.isPassed
        && activeLessonQuiz.remainingAttempts !== null
        && activeLessonQuiz.remainingAttempts !== undefined
        && activeLessonQuiz.remainingAttempts <= 0
    );
    const isInteractiveModalOpen = Boolean(activeQuestion);
    const activeLessonVideo = activeLesson?.video ?? null;
    const playableVideo = canRenderLessonVideo(activeLessonVideo) ? activeLessonVideo : null;

    const answeredIds = useMemo(
        () => new Set(
            activeLesson?.interactiveQuestions
                .filter((question) => question.answered)
                .map((question) => question.id) || []
        ),
        [activeLesson]
    );
    const nextPendingInteractive = useMemo(
        () => getNextPendingInteractive(activeLesson, answeredIds, currentTime),
        [activeLesson, answeredIds, currentTime]
    );
    const courseWatchPercent = useMemo(() => {
        const derivedWatchPercent = calculateCourseWatchPercent(course, { activeLessonId, currentTime });
        return Math.max(Number(course?.watchPercent ?? 0), derivedWatchPercent);
    }, [course, activeLessonId, currentTime]);
    const activeLessonWatchPercent = useMemo(
        () => calculateWatchPercent(
            Math.max(
                Number(activeLesson?.progress.lastWatchedSeconds ?? 0),
                Number(currentTime ?? 0),
            ),
            Number(activeLesson?.video?.duration ?? 0),
        ),
        [activeLesson, currentTime]
    );
    const roundedCourseWatchPercent = Math.round(courseWatchPercent);
    const roundedCourseCompletionPercent = Math.round(Number(course?.completionPercent ?? course?.progressPercent ?? 0));
    const roundedActiveLessonWatchPercent = Math.round(activeLessonWatchPercent);
    const nextAvailableLesson = useMemo(() => {
        if (!course || !activeLessonId) {
            return null;
        }

        const currentLessonIndex = course.lessons.findIndex((lesson) => lesson.id === activeLessonId);
        if (currentLessonIndex < 0) {
            return null;
        }

        return course.lessons.slice(currentLessonIndex + 1).find((lesson) => lesson.status !== 'locked') || null;
    }, [course, activeLessonId]);
    const answeredInteractiveCount = activeLesson?.interactiveQuestions.filter((question) => question.answered).length ?? 0;

    const previewLessonDocument = useCallback(async (lessonDocument: LearningLessonDocument) => {
        if (typeof window === 'undefined' || !lessonDocument.fileUrl) {
            return;
        }

        const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (!previewWindow) {
            setLessonNotice(t('popupBlocked'));
            return;
        }

        try {
            if (!isDataUrl(lessonDocument.fileUrl)) {
                previewWindow.location.href = lessonDocument.fileUrl;
                return;
            }

            const response = await fetch(lessonDocument.fileUrl);
            const fileBlob = await response.blob();
            const objectUrl = window.URL.createObjectURL(fileBlob);
            previewWindow.location.href = objectUrl;

            window.setTimeout(() => {
                window.URL.revokeObjectURL(objectUrl);
            }, 60_000);
        } catch (error) {
            previewWindow.close();
            console.error('Failed to preview lesson document', error);
            setLessonNotice(t('previewFailed'));
        }
    }, [t]);

    const downloadLessonDocument = useCallback(async (lessonDocument: LearningLessonDocument) => {
        if (typeof window === 'undefined' || !lessonDocument.fileUrl) {
            return;
        }

        try {
            if (isDataUrl(lessonDocument.fileUrl)) {
                const immediateDownloadLink = document.createElement('a');
                immediateDownloadLink.href = lessonDocument.fileUrl;
                immediateDownloadLink.download = lessonDocument.fileName;
                immediateDownloadLink.rel = 'noreferrer';
                immediateDownloadLink.style.display = 'none';
                document.body.appendChild(immediateDownloadLink);
                immediateDownloadLink.click();
                immediateDownloadLink.remove();
                return;
            }

            const downloadLink = document.createElement('a');
            downloadLink.href = lessonDocument.fileUrl;
            downloadLink.download = lessonDocument.fileName;
            downloadLink.rel = 'noreferrer';
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
        } catch (error) {
            console.error('Failed to download lesson document', error);
            setLessonNotice(t('downloadFailed'));
        }
    }, [t]);

    const getKnownMaxReachedSeconds = (lesson: LearningLessonData, fallbackSeconds = 0) => Math.max(
        maxReachedSecondsByLessonRef.current.get(lesson.id)
            ?? normalizePlaybackSecond(lesson.progress.lastWatchedSeconds || fallbackSeconds),
        0,
    );

    const recordPlaybackObservation = (lessonId: number, seconds: number) => {
        lastPlaybackObservationByLessonRef.current.set(lessonId, {
            seconds,
            observedAt: Date.now(),
        });
    };

    const syncPlaybackState = (lessonId: number, seconds: number, options?: { updateMaxReached?: boolean }) => {
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
    };

    function rollbackForwardSeek(lesson: LearningLessonData, attemptedSeconds: number) {
        const rollbackSeconds = getKnownMaxReachedSeconds(lesson);
        syncPlaybackState(lesson.id, rollbackSeconds);
        setLessonNotice(t('seekBlocked'));
        logInteractiveDebug('blocked-forward-seek', {
            lessonId: lesson.id,
            attemptedSeconds,
            rollbackSeconds,
        });

        void playerRef.current?.setCurrentTime(rollbackSeconds).catch(() => undefined);
        void maybeOpenInteractive(rollbackSeconds);
    }

    const shouldTreatAsForwardSkip = (lesson: LearningLessonData, nextSeconds: number) => {
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
    };

    const persistProgress = useCallback(async (lessonId: number, seconds: number, force = false) => {
        const roundedSeconds = normalizePlaybackSecond(seconds);
        watchedSecondsByLessonRef.current.set(lessonId, roundedSeconds);

        const lastRequestedSeconds = lastRequestedSecondsByLessonRef.current.get(lessonId);
        if (!force && lastRequestedSeconds !== undefined && Math.abs(roundedSeconds - lastRequestedSeconds) < 5) {
            return;
        }

        lastRequestedSecondsByLessonRef.current.set(lessonId, roundedSeconds);
        const requestVersion = (progressRequestVersionByLessonRef.current.get(lessonId) ?? 0) + 1;
        progressRequestVersionByLessonRef.current.set(lessonId, requestVersion);

        try {
            const progress = await learningApi.updateLessonProgress(lessonId, roundedSeconds);
            if (progressRequestVersionByLessonRef.current.get(lessonId) !== requestVersion) {
                return;
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
                                    lastWatchedSeconds: normalizePlaybackSecond(progress.lastWatchedSeconds),
                                    isCompleted: progress.isCompleted,
                                },
                            }
                            : item
                    ),
                };
            });
        } catch (error) {
            const syncNotice = getProgressSyncNotice(error);
            if (syncNotice) {
                setLessonNotice(syncNotice);
            }
        }
    }, []);

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
            setCourse(learningData);

            const selectedLesson = options?.mode === 'preserveSelectedLesson' && options.preferredLessonId
                ? learningData.lessons.find((lesson) => (
                    lesson.id === options.preferredLessonId && lesson.status !== 'locked'
                ))
                : null;
            const serverLesson = learningData.lessons.find((lesson) => (
                lesson.id === learningData.currentLessonId && lesson.status !== 'locked'
            )) || learningData.lessons.find((lesson) => (
                lesson.id === learningData.lastAccessedLessonId && lesson.status !== 'locked'
            ));
            const fallbackLesson = serverLesson || findFirstAvailableLesson(learningData.lessons);

            setActiveLessonId(selectedLesson?.id || fallbackLesson?.id || null);
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                router.push('/sign-in');
                return;
            }

            setPageError(getApiErrorMessage(error, t('loadFailed')));
        } finally {
            setIsLoading(false);
        }
    }, [courseId, router, t]);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        void loadCourseLearning({ mode: 'followServerCurrentLesson' });
    }, [isAuthenticated, isAuthLoading, loadCourseLearning, router]);

    activeLessonRef.current = activeLesson;
    answeredIdsRef.current = answeredIds;

    useLayoutEffect(() => {
        const resolvedLessonSeconds = activeLesson
            ? watchedSecondsByLessonRef.current.get(activeLesson.id)
                ?? normalizePlaybackSecond(activeLesson.progress.lastWatchedSeconds || 0)
            : 0;

        if (activeLesson) {
            watchedSecondsByLessonRef.current.set(activeLesson.id, resolvedLessonSeconds);
            maxReachedSecondsByLessonRef.current.set(
                activeLesson.id,
                Math.max(
                    maxReachedSecondsByLessonRef.current.get(activeLesson.id) ?? 0,
                    resolvedLessonSeconds,
                ),
            );
            if (!lastRequestedSecondsByLessonRef.current.has(activeLesson.id)) {
                lastRequestedSecondsByLessonRef.current.set(
                    activeLesson.id,
                    normalizePlaybackSecond(activeLesson.progress.lastWatchedSeconds || 0)
                );
            }
            recordPlaybackObservation(activeLesson.id, resolvedLessonSeconds);
        }

        setPageError('');
        setCurrentTime(resolvedLessonSeconds);
        currentTimeRef.current = resolvedLessonSeconds;
        activeQuestionIdRef.current = null;
        setActiveQuestion(null);
        setSelectedOptionId('');
        setWrittenAnswer('');
        setSubmitError('');
        setLessonNotice('');
        setIsQuizPanelOpen(false);
        setIsQuizLoading(false);
        setIsQuizSubmitting(false);
        setLessonQuizRuntime(null);
        setLessonQuizAnswers({});
        setLessonQuizError('');
        setLessonQuizResult(null);
    }, [activeLesson?.id]);

    useEffect(() => {
        const lessonId = activeLesson?.id;

        return () => {
            if (!lessonId) {
                return;
            }

            const trackedSeconds = watchedSecondsByLessonRef.current.get(lessonId)
                ?? normalizePlaybackSecond(activeLesson?.progress.lastWatchedSeconds || 0);
            void persistProgress(lessonId, trackedSeconds, true);
        };
    }, [activeLesson?.id, persistProgress]);

    useEffect(() => {
        if (!activeLesson || !playableVideo) {
            return;
        }

        const pausePlaybackWhenPageIsHidden = () => {
            const visibilityState = typeof document.visibilityState === 'string'
                ? document.visibilityState
                : (document.hidden ? 'hidden' : 'visible');
            if (visibilityState === 'visible') {
                return;
            }

            const trackedSeconds = watchedSecondsByLessonRef.current.get(activeLesson.id)
                ?? normalizePlaybackSecond(currentTimeRef.current || activeLesson.progress.lastWatchedSeconds || 0);
            void playerRef.current?.pause().catch(() => undefined);
            void persistProgress(activeLesson.id, trackedSeconds, true);
        };

        const handlePageHide = () => {
            const trackedSeconds = watchedSecondsByLessonRef.current.get(activeLesson.id)
                ?? normalizePlaybackSecond(currentTimeRef.current || activeLesson.progress.lastWatchedSeconds || 0);
            void playerRef.current?.pause().catch(() => undefined);
            void persistProgress(activeLesson.id, trackedSeconds, true);
        };

        document.addEventListener('visibilitychange', pausePlaybackWhenPageIsHidden);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', pausePlaybackWhenPageIsHidden);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [activeLesson, persistProgress, playableVideo]);

    useEffect(() => {
        setSelectedSupplementTab((currentTab) => resolveLessonSupplementTab(activeLesson, currentTab));
    }, [activeLesson]);

    const maybeOpenInteractive = useCallback(async (seconds: number) => {
        const lesson = activeLessonRef.current;
        const nextQuestion = getNextPendingInteractive(lesson, answeredIdsRef.current, seconds);
        if (!nextQuestion || activeQuestionIdRef.current === nextQuestion.id) {
            return;
        }

        logInteractiveDebug('open-pending-question', {
            lessonId: lesson?.id ?? null,
            questionId: nextQuestion.id,
            atSeconds: normalizePlaybackSecond(seconds),
            displayAtSeconds: nextQuestion.displayAtSeconds,
        });

        activeQuestionIdRef.current = nextQuestion.id;
        setSubmitError('');
        setLessonNotice('');
        setSelectedOptionId('');
        setWrittenAnswer('');
        setActiveQuestion(nextQuestion);

        try {
            await playerRef.current?.pause();
        } catch {
            // Ignore pause failures and keep the modal open.
        }
    }, []);

    const maybeCompleteLesson = useCallback(async () => {
        const lesson = activeLessonRef.current;
        if (!course || !lesson || lesson.progress.isCompleted || isCompletingLesson) {
            return;
        }

        if (lesson.lessonQuiz && !lesson.lessonQuiz.latestAttempt?.isPassed) {
            setLessonNotice(
                lesson.lessonQuiz.remainingAttempts !== null
                && lesson.lessonQuiz.remainingAttempts !== undefined
                && lesson.lessonQuiz.remainingAttempts <= 0
                    ? t('quizAttemptsExhaustedNotice')
                    : t('quizPassRequired')
            );
            return;
        }

        setIsCompletingLesson(true);
        try {
            const watchedSeconds = watchedSecondsByLessonRef.current.get(lesson.id)
                ?? normalizePlaybackSecond(currentTimeRef.current);
            await persistProgress(lesson.id, watchedSeconds, true);
            await learningApi.markLessonComplete(course.id, lesson.id);
            await loadCourseLearning({ mode: 'followServerCurrentLesson' });
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                router.push('/sign-in');
                return;
            }

            const lessonErrorNotice = getLessonErrorNotice(error, t('interactiveIncompleteNotice'));
            if (lessonErrorNotice) {
                setLessonNotice(lessonErrorNotice);
                if (isApiError(error) && error.code === 'INTERACTIVE_INCOMPLETE') {
                    await maybeOpenInteractive(currentTimeRef.current);
                    logInteractiveDebug('completion-blocked-by-interactive', {
                        lessonId: lesson.id,
                        currentTime: normalizePlaybackSecond(currentTimeRef.current),
                    });
                }
            } else if (isForbiddenApiError(error)) {
                setPageError(getApiErrorMessage(error, t('noLessonAccess')));
            } else {
                setPageError(getApiErrorMessage(error, t('completeLessonFailed')));
            }
        } finally {
            setIsCompletingLesson(false);
        }
    }, [course, isCompletingLesson, loadCourseLearning, maybeOpenInteractive, persistProgress, router, t]);

    const handleLessonSelect = (lesson: LearningLessonData) => {
        if (lesson.status === 'locked') {
            return;
        }

        setActiveLessonId(lesson.id);
    };

    const handleSubmitInteractive = async () => {
        if (!activeQuestion) {
            return;
        }

        const questionToSubmit = activeQuestion;
        const lessonId = questionToSubmit.lessonId;
        const answerGiven = activeQuestion.questionType === 'SHORT_ANSWER'
            ? writtenAnswer.trim()
            : selectedOptionId.trim();

        if (!answerGiven) {
            setSubmitError(t('answerRequired'));
            return;
        }

        setIsAnswerSubmitting(true);
        setSubmitError('');
        setLessonNotice('');

        try {
            await learningApi.submitVideoQuestionAnswer(questionToSubmit.id, answerGiven);

            const updatedAnsweredIds = new Set(answeredIdsRef.current);
            updatedAnsweredIds.add(questionToSubmit.id);
            answeredIdsRef.current = updatedAnsweredIds;
            activeQuestionIdRef.current = null;

            const updatedLesson = (() => {
                const lessonSnapshot = activeLessonRef.current?.id === lessonId
                    ? activeLessonRef.current
                    : course?.lessons.find((lesson) => lesson.id === lessonId) || null;
                if (!lessonSnapshot) {
                    return null;
                }

                return {
                    ...lessonSnapshot,
                    interactiveQuestions: lessonSnapshot.interactiveQuestions.map((question) =>
                        question.id === questionToSubmit.id
                            ? { ...question, answered: true }
                            : question
                    ),
                };
            })();

            setCourse((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    lessons: current.lessons.map((lesson) =>
                        lesson.id === lessonId
                            ? {
                                ...lesson,
                                interactiveQuestions: lesson.interactiveQuestions.map((question) =>
                                    question.id === questionToSubmit.id
                                        ? { ...question, answered: true }
                                        : question
                                ),
                            }
                            : lesson
                    ),
                };
            });

            const nextQuestion = getNextPendingInteractive(updatedLesson, updatedAnsweredIds, currentTimeRef.current);

            setActiveQuestion(nextQuestion);
            setSelectedOptionId('');
            setWrittenAnswer('');

            if (!nextQuestion) {
                if (updatedLesson?.video && currentTimeRef.current >= Math.max(0, updatedLesson.video.duration - 1)) {
                    await maybeCompleteLesson();
                }
                const player = playerRef.current;
                if (player) {
                    await player.play().catch(() => undefined);
                }
            } else {
                activeQuestionIdRef.current = nextQuestion.id;
            }
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                router.push('/sign-in');
            } else {
                setSubmitError(getApiErrorMessage(error, t('submitFailed')));
            }
        } finally {
            setIsAnswerSubmitting(false);
        }
    };

    const isQuestionAnswered = (questionId: number) => answeredIds.has(questionId);
    const hasPendingInteractive = answeredInteractiveCount < (activeLesson?.interactiveQuestions.length ?? 0);
    const isLessonQuizReady = Boolean(
        activeLesson
        && canRenderLessonVideo(activeLesson.video)
        && roundedActiveLessonWatchPercent >= 100
        && !hasPendingInteractive
    );

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
                    : t('quizInteractiveRequiredBeforeStart')
            );
            return;
        }

        setLessonNotice('');
        setLessonQuizError('');
        setLessonQuizResult(null);
        setIsQuizPanelOpen(true);

        if (lessonQuizRuntime && lessonQuizRuntime.lessonId === activeLesson.id) {
            return;
        }

        setIsQuizLoading(true);
        try {
            const quizRuntime = await learningApi.getLessonQuizRuntime(activeLesson.id);
            setLessonQuizRuntime(quizRuntime);
            setLessonQuizAnswers({});
        } catch (error) {
            if (isUnauthorizedApiError(error)) {
                router.push('/sign-in');
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
    }, [activeLesson, isLessonQuizExhausted, isLessonQuizReady, lessonQuizRuntime, roundedActiveLessonWatchPercent, router, t]);

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
                        : t('quizAttemptsExhaustedNotice')
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
                router.push('/sign-in');
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
    }, [activeLesson, lessonQuizAnswers, lessonQuizRuntime, router, t]);

    const enrolledDateLabel = useMemo(() => {
        if (!course?.enrolledAt) {
            return '-';
        }

        return formatLocaleDate(course.enrolledAt, locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }, [course?.enrolledAt, locale]);
    const activeLessonDurationLabel = activeLesson?.video
        ? formatDuration(activeLesson.video.duration)
        : t('noVideo');
    const activeLessonSummaryLabel = activeLesson?.status === 'locked'
        ? t('finishPreviousLessonFirst')
        : `${activeLessonDurationLabel}${(activeLesson?.documents.length ?? 0) > 0 ? ` • ${activeLesson?.documents.length} ${t('documentsUnit')}` : ''}`;
    const lessonStatePill = activeLesson?.progress.isCompleted
        ? {
            label: t('lessonCompleted'),
            className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
            icon: CheckCircle2,
        }
        : roundedActiveLessonWatchPercent < 100
            ? {
                label: t('mustFinishVideo'),
                className: 'border border-amber-200 bg-amber-50 text-amber-700',
                icon: Flame,
            }
            : activeLessonQuiz && !isLessonQuizPassed
                ? {
                    label: isLessonQuizExhausted ? t('quizAttemptsExhaustedShort') : t('quizPassRequiredShort'),
                    className: 'border border-violet-200 bg-violet-50 text-violet-700',
                    icon: BookOpen,
                }
            : {
                label: t('readyToComplete'),
                className: 'border border-sky-200 bg-sky-50 text-sky-700',
                icon: PlayCircle,
            };
    const LessonStateIcon = lessonStatePill.icon;
    const shouldShowCompletionButton = (
        activeLesson?.progress.isCompleted
        || isCompletingLesson
        || !canRenderLessonVideo(activeLesson?.video)
        || (!activeLessonQuiz && roundedActiveLessonWatchPercent >= 100)
        || Boolean(activeLessonQuiz && isLessonQuizPassed)
    );
    const supplementTabs = [
        {
            id: 'documents' as const,
            label: t('documentsTab'),
            count: activeLesson?.documents.length ?? 0,
            icon: FileText,
            tone: 'emerald' as const,
        },
        {
            id: 'interactive' as const,
            label: t('interactiveTab'),
            count: activeLesson?.interactiveQuestions.length ?? 0,
            icon: Sparkles,
            tone: 'amber' as const,
        },
    ];

    if (isLoading || isAuthLoading) {
        return (
            <section className="flex min-h-[70vh] items-center justify-center" style={{ background: 'linear-gradient(135deg, #f7faf9 0%, #edf7f4 100%)' }}>
                <div className="text-center">
                    <div className="relative mx-auto h-16 w-16">
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#004736]" />
                        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-[#40C7A9]" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                    <p className="mt-5 text-sm font-medium text-slate-500">{t('loading')}</p>
                </div>
            </section>
        );
    }

    if (pageError || !course || !activeLesson) {
        return (
            <section className="flex min-h-[70vh] items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f7faf9 0%, #edf7f4 100%)' }}>
                <div className="w-full max-w-lg">
                    <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-lg shadow-red-500/5">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </div>
                        <h2 className="text-center text-2xl font-bold text-slate-900">{t('accessDeniedTitle')}</h2>
                        <p className="mt-2 text-center text-slate-500">{pageError || t('courseNotFound')}</p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link href="/courses-grid" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#004736] to-[#006650] px-6 py-3 font-semibold text-white shadow-md shadow-[#004736]/20 transition-all hover:shadow-lg">
                                {t('backToCourses')}
                            </Link>
                            <Link href="/profile" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50">
                                {t('goToProfile')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4 sm:py-6 lg:py-10" style={{ background: '#f7faf9', minHeight: '100vh' }}>
            <div
                className={`mx-auto w-full max-w-[1280px] px-3 sm:px-4 lg:px-6 transition-[filter] ${isInteractiveModalOpen ? 'pointer-events-none select-none' : ''}`}
                aria-hidden={isInteractiveModalOpen}
            >
                <div className="flex flex-col-reverse gap-5 lg:flex-row lg:items-start">
                    <aside className="space-y-4 lg:w-[300px] lg:flex-none lg:sticky lg:top-6">
                        <div className="overflow-hidden rounded-[24px] border border-[#dcece6] bg-white shadow-[0_16px_40px_rgba(15,86,63,0.08)]">
                            <div className="border-b border-[#e6f3ef] px-5 py-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b8d84]">{t('courseProgress')}</p>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="relative flex h-20 w-20 items-center justify-center">
                                        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                                            <circle cx="40" cy="40" r="34" fill="none" stroke="#e6f3ef" strokeWidth="6" />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="34"
                                                fill="none"
                                                stroke="#1ec997"
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                                strokeDasharray={`${roundedCourseWatchPercent * 2.136} 213.6`}
                                                className="transition-all duration-700"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-[#004736]">
                                            <div className="flex items-baseline justify-center leading-none">
                                                <span className="text-[1.45rem] font-bold tabular-nums sm:text-[1.6rem]">{roundedCourseWatchPercent}</span>
                                                <span className="ml-0.5 text-[0.8rem] font-semibold">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t('lessonSequence', { count: activeLesson.sequenceOrder })}</p>
                                        <p className="mt-1.5 text-lg font-bold leading-tight text-[#004736] sm:text-[1.3rem]">{activeLesson.title}</p>
                                        <p className="mt-1.5 text-sm leading-6 text-slate-500">{activeLessonSummaryLabel}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 px-5 py-5">
                                <div>
                                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                                        <span>{t('progress')}</span>
                                        <span className="text-[#004736]">{roundedCourseWatchPercent}%</span>
                                    </div>
                                    <div className="mt-3 h-2.5 rounded-full bg-[#e9f4f0]">
                                        <div
                                            className="h-2.5 rounded-full bg-gradient-to-r from-[#14b886] to-[#1fd0a1] transition-all duration-500"
                                            style={{ width: `${roundedCourseWatchPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#f5fbf8] px-4 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{t('learningSummary')}</p>
                                    <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-700">
                                        {t('completedLessons', {
                                            completed: course.completedLessons.length,
                                            total: course.lessons.length,
                                            percent: roundedCourseCompletionPercent,
                                        })}
                                    </p>
                                    <p className="mt-1.5 text-sm text-slate-500">{t('startedAt', { date: enrolledDateLabel })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[24px] border border-[#dcece6] bg-white shadow-[0_16px_40px_rgba(15,86,63,0.08)]">
                            <div className="flex items-center justify-between border-b border-[#edf5f1] px-5 py-4">
                                <div>
                                    <h2 className="text-[17px] font-bold text-slate-900 sm:text-lg">{t('allLessons')}</h2>
                                    <p className="mt-1 text-sm text-slate-500">{t('lessonsInCourse', { count: course.lessons.length })}</p>
                                </div>
                                <span className="rounded-full bg-[#edf7f4] px-3 py-1 text-xs font-semibold text-[#0f6f56]">{t('lessonsBadge', { count: course.lessons.length })}</span>
                            </div>
                            <div className="max-h-[calc(100vh-300px)] space-y-1.5 overflow-y-auto px-3 py-3">
                                {course.lessons.map((lesson) => {
                                    const isActive = lesson.id === activeLesson.id;
                                    const isLocked = lesson.status === 'locked';
                                    const isCompleted = lesson.status === 'completed';
                                    const LessonIcon = isLocked
                                        ? LockKeyhole
                                        : isCompleted
                                            ? CheckCircle2
                                            : PlayCircle;

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect(lesson)}
                                            disabled={isLocked}
                                            className={`group relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                                                isActive
                                                    ? 'border-[#2dc39a]/40 bg-[#eefaf5] shadow-[0_12px_30px_rgba(17,120,92,0.12)]'
                                                    : isLocked
                                                        ? 'cursor-not-allowed border-transparent bg-slate-50/80 opacity-70'
                                                        : 'border-transparent bg-white hover:border-[#d8ece4] hover:bg-[#f8fcfa]'
                                            }`}
                                        >
                                            {isActive && <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#1ec997]" />}
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                                                    isLocked
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : isCompleted
                                                            ? 'bg-emerald-500 text-white'
                                                            : isActive
                                                                ? 'bg-[#004736] text-white'
                                                                : 'bg-[#edf7f4] text-[#0f6f56]'
                                                }`}>
                                                    <LessonIcon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className={`text-[15px] font-semibold leading-6 ${
                                                                isActive ? 'text-[#004736]' : isLocked ? 'text-slate-500' : 'text-slate-900'
                                                            }`}>
                                                                {lesson.sequenceOrder} {lesson.title}
                                                            </p>
                                                            <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                                                                {isLocked
                                                                    ? t('lessonLockedSummary')
                                                                    : `${lesson.video ? formatDuration(lesson.video.duration) : t('noVideo')}${lesson.documents.length > 0 ? ` • ${lesson.documents.length} ${t('documentsUnit')}` : ''}`}
                                                            </p>
                                                        </div>
                                                        {!isLocked && (
                                                            <ChevronRight className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                                                                isActive ? 'text-[#0f6f56]' : 'text-slate-300'
                                                            }`} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <main className="min-w-0 space-y-5 lg:flex-1">
                        <div className="overflow-hidden rounded-[24px] border border-[#dcece6] bg-white shadow-[0_16px_40px_rgba(15,86,63,0.08)]">
                            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                                <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-slate-400 sm:text-sm">
                                    <span className="text-slate-500">{course.title}</span>
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="font-semibold text-[#0f6f56]">{t('video')}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#0f6f56]">{t('lessonNumber', { count: activeLesson.sequenceOrder })}</p>
                                        <h1 className="mt-2 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-slate-900">{activeLesson.title}</h1>
                                        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 sm:text-[17px]">
                                            {course.description || t('defaultDescription')}
                                        </p>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${lessonStatePill.className}`}>
                                        <LessonStateIcon className="h-4 w-4" />
                                        {lessonStatePill.label}
                                    </div>
                                </div>
                            </div>

                            {playableVideo ? (
                                <div className="mt-5 border-y border-[#edf5f1] bg-[#f9fcfb] px-3 py-3 sm:px-5">
                                    <div className="overflow-hidden rounded-[24px] bg-slate-950 shadow-[0_22px_48px_rgba(17,24,39,0.22)] ring-1 ring-black/5">
                                    <div
                                        className={`aspect-video ${isInteractiveModalOpen ? 'pointer-events-none' : ''}`}
                                        aria-hidden={isInteractiveModalOpen}
                                        data-testid="learning-player-wrapper"
                                        data-interaction-disabled={isInteractiveModalOpen ? 'true' : 'false'}
                                    >
                                        <VimeoLessonPlayer
                                            key={playableVideo.playbackUrl || playableVideo.resourceId}
                                            playbackUrl={playableVideo.playbackUrl!}
                                            title={activeLesson.title}
                                            resumeAt={activeLesson.progress.lastWatchedSeconds || 0}
                                            interactionDisabled={isInteractiveModalOpen}
                                            playerRef={playerRef}
                                            onInitialTimeResolved={(seconds) => {
                                                const normalizedSeconds = normalizePlaybackSecond(seconds);
                                                syncPlaybackState(activeLesson.id, normalizedSeconds, {
                                                    updateMaxReached: true,
                                                });
                                                logInteractiveDebug('initial-position-resolved', {
                                                    lessonId: activeLesson.id,
                                                    seconds: normalizedSeconds,
                                                });
                                                void maybeOpenInteractive(normalizedSeconds);
                                            }}
                                            onTimeUpdate={(seconds) => {
                                                const normalizedSeconds = normalizePlaybackSecond(seconds);
                                                if (shouldTreatAsForwardSkip(activeLesson, normalizedSeconds)) {
                                                    rollbackForwardSeek(activeLesson, normalizedSeconds);
                                                    return;
                                                }

                                                const shouldExtendMaxReached = normalizedSeconds > getKnownMaxReachedSeconds(activeLesson);
                                                syncPlaybackState(activeLesson.id, normalizedSeconds, {
                                                    updateMaxReached: shouldExtendMaxReached,
                                                });
                                                void persistProgress(activeLesson.id, normalizedSeconds);
                                                void maybeOpenInteractive(normalizedSeconds);
                                            }}
                                            onSeeked={(seconds) => {
                                                const normalizedSeconds = normalizePlaybackSecond(seconds);
                                                const maxReachedSeconds = getKnownMaxReachedSeconds(activeLesson);
                                                const maxAllowedSeconds = maxReachedSeconds + SEEK_AHEAD_TOLERANCE_SECONDS;

                                                if (normalizedSeconds > maxAllowedSeconds) {
                                                    rollbackForwardSeek(activeLesson, normalizedSeconds);
                                                    return;
                                                }

                                                syncPlaybackState(activeLesson.id, normalizedSeconds, {
                                                    updateMaxReached: normalizedSeconds > maxReachedSeconds,
                                                });
                                                void persistProgress(activeLesson.id, normalizedSeconds, true);
                                                void maybeOpenInteractive(normalizedSeconds);
                                            }}
                                            onPause={(seconds) => {
                                                const resolvedSeconds = normalizePlaybackSecond(seconds || currentTimeRef.current || 0);
                                                syncPlaybackState(activeLesson.id, resolvedSeconds);
                                                void persistProgress(activeLesson.id, resolvedSeconds, true);
                                            }}
                                            onEnded={() => {
                                                const duration = normalizePlaybackSecond(playableVideo.duration || currentTimeRef.current || 0);
                                                syncPlaybackState(activeLesson.id, duration, { updateMaxReached: true });
                                                void persistProgress(activeLesson.id, duration, true);
                                                void maybeCompleteLesson();
                                            }}
                                        />
                                    </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 border-y border-[#edf5f1] bg-[#f9fcfb] px-3 py-3 sm:px-5">
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                        <PlayCircle className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">{getVideoAvailabilityMessage(activeLesson.video?.status, activeLesson.video?.duration, t)}</p>
                                </div>
                                </div>
                            )}

                            <div className="space-y-5 px-5 py-5 sm:px-6">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbeee7] bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 sm:text-sm">
                                            <Clock3 className="h-4 w-4" />
                                            {t('lastAccessed', { date: enrolledDateLabel })}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbeee7] bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 sm:text-sm">
                                            <Eye className="h-4 w-4" />
                                            {t('watchedSummary', {
                                                duration: formatDuration(currentTime),
                                                percent: roundedActiveLessonWatchPercent,
                                            })}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbeee7] bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 sm:text-sm">
                                            <FileText className="h-4 w-4" />
                                            {t('documentCount', { count: activeLesson.documents.length })}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbeee7] bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 sm:text-sm">
                                            <Flame className="h-4 w-4" />
                                            {t('interactiveCount', {
                                                answered: answeredInteractiveCount,
                                                total: activeLesson.interactiveQuestions.length,
                                            })}
                                        </span>
                                        {course.hasCertificate && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[13px] font-medium text-emerald-700 sm:text-sm">
                                                <Medal className="h-4 w-4" />
                                                {t('certificateAfterComplete')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        {nextAvailableLesson && nextAvailableLesson.id !== activeLesson.id && (
                                            <button
                                                type="button"
                                                onClick={() => handleLessonSelect(nextAvailableLesson)}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f6f56] to-[#18a676] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,111,86,0.22)] transition hover:shadow-[0_18px_34px_rgba(15,111,86,0.28)]"
                                            >
                                                {t('nextLesson')}
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        )}
                                        {shouldShowCompletionButton && (
                                            <button
                                                onClick={() => void maybeCompleteLesson()}
                                                disabled={
                                                    isCompletingLesson
                                                    || activeLesson.progress.isCompleted
                                                    || !canRenderLessonVideo(activeLesson.video)
                                                    || roundedActiveLessonWatchPercent < 100
                                                    || Boolean(activeLessonQuiz && !isLessonQuizPassed)
                                                }
                                                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    activeLesson.progress.isCompleted
                                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border border-[#d5eae2] bg-white text-slate-700 hover:border-[#0f6f56] hover:text-[#0f6f56]'
                                                }`}
                                            >
                                                {activeLesson.progress.isCompleted
                                                    ? t('completionDone')
                                                    : isCompletingLesson
                                                        ? t('completionSaving')
                                                        : activeLesson.video?.status === 'PROCESSING' || Number(activeLesson.video?.duration ?? 0) <= 0
                                                            ? t('completionProcessing')
                                                            : activeLesson.video?.status === 'FAILED'
                                                                ? t('completionFailed')
                                                                : activeLessonQuiz && !isLessonQuizPassed
                                                                    ? isLessonQuizExhausted
                                                                        ? t('completionQuizExhausted')
                                                                        : t('completionQuizLocked')
                                                                : roundedActiveLessonWatchPercent < 100
                                                                    ? t('completionLocked')
                                                                    : t('completionCta')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {lessonNotice && (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                        {lessonNotice}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[24px] border border-[#dcece6] bg-white shadow-[0_16px_40px_rgba(15,86,63,0.07)]">
                            <div
                                className="flex flex-wrap items-center gap-2 border-b border-[#edf5f1] px-5 py-4"
                                role="tablist"
                                aria-label={t('supplementAriaLabel')}
                            >
                                {supplementTabs.map((tab) => {
                                    const isSelected = selectedSupplementTab === tab.id;
                                    const Icon = tab.icon;
                                    const selectedClassName = tab.tone === 'emerald'
                                        ? 'border-[#dbeee7] bg-[#f8fcfa] text-[#0f6f56] shadow-[0_10px_24px_rgba(15,111,86,0.10)]'
                                        : 'border-[#eee7d9] bg-[#fff9ef] text-[#b7791f] shadow-[0_10px_24px_rgba(183,121,31,0.10)]';
                                    const hoverClassName = tab.tone === 'emerald'
                                        ? 'hover:border-[#dbeee7] hover:bg-[#f8fcfa] hover:text-[#0f6f56]'
                                        : 'hover:border-[#eee7d9] hover:bg-[#fff9ef] hover:text-[#b7791f]';
                                    const countClassName = tab.tone === 'emerald'
                                        ? 'text-[#0f6f56]'
                                        : 'text-[#b7791f]';

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            role="tab"
                                            id={`lesson-supplement-tab-${tab.id}`}
                                            aria-selected={isSelected}
                                            aria-controls={`lesson-supplement-panel-${tab.id}`}
                                            tabIndex={isSelected ? 0 : -1}
                                            onClick={() => setSelectedSupplementTab(tab.id)}
                                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[15px] font-semibold transition-all ${
                                                isSelected
                                                    ? selectedClassName
                                                    : `border-transparent bg-white text-slate-500 ${hoverClassName}`
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                            <span className={`rounded-full bg-white px-2 py-0.5 text-xs ${countClassName}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div
                                className="px-4 py-4 sm:px-5"
                                role="tabpanel"
                                id={`lesson-supplement-panel-${selectedSupplementTab}`}
                                aria-labelledby={`lesson-supplement-tab-${selectedSupplementTab}`}
                            >
                                {selectedSupplementTab === 'documents' ? (
                                    <div>
                                        <h3 className="sr-only">{t('documentsSectionTitle')}</h3>
                                        {activeLesson.documents.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                                                <p className="text-sm text-slate-400">{t('noDocuments')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {activeLesson.documents.map((document) => (
                                                    <div
                                                        key={document.id}
                                                        className="group flex items-center gap-3 rounded-2xl border border-[#e4f0eb] bg-[#fbfdfc] px-4 py-4 transition-all hover:border-[#c7e6da] hover:bg-[#f6fbf9]"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => void previewLessonDocument(document)}
                                                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#5b7fff] shadow-sm transition hover:text-[#0f6f56]"
                                                            aria-label={t('openDocumentAria', { name: document.fileName })}
                                                            title={t('openDocumentTitle')}
                                                        >
                                                            <FileText className="h-5 w-5" />
                                                        </button>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-[15px] font-semibold text-slate-900">{document.fileName}</p>
                                                            <p className="mt-1 text-[13px] text-slate-400">{t('pdfDocument')} • {formatFileSize(document.sizeBytes)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => void downloadLessonDocument(document)}
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfeee8] bg-white text-slate-500 transition hover:border-[#0f6f56] hover:bg-[#f8fcfa] hover:text-[#0f6f56]"
                                                                aria-label={t('downloadDocumentAria', { name: document.fileName })}
                                                                title={t('downloadDocumentTitle')}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{t('interactiveSectionTitle')}</h3>
                                                <p className="mt-1 text-sm text-slate-400">{t('answeredCount', {
                                                    answered: answeredInteractiveCount,
                                                    total: activeLesson.interactiveQuestions.length,
                                                })}</p>
                                            </div>
                                            <span className="rounded-full bg-[#fff6e8] px-3 py-1 text-xs font-semibold text-[#d97706]">{activeLesson.interactiveQuestions.length}</span>
                                        </div>
                                        {activeLesson.interactiveQuestions.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                                                <p className="text-sm text-slate-400">{t('noInteractive')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3 xl:grid-cols-2">
                                                {activeLesson.interactiveQuestions.map((question) => (
                                                    <div key={question.id} className={`rounded-2xl border px-4 py-4 transition-all ${
                                                        isQuestionAnswered(question.id)
                                                            ? 'border-emerald-200 bg-emerald-50/70'
                                                            : 'border-[#ecefee] bg-[#fbfdfc]'
                                                    }`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                                                isQuestionAnswered(question.id)
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-[#fff2de] text-[#d97706]'
                                                            }`}>
                                                                {isQuestionAnswered(question.id) ? (
                                                                    <CheckCircle2 className="h-5 w-5" />
                                                                ) : (
                                                                    <Flame className="h-5 w-5" />
                                                                )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                        <p className="text-[15px] font-semibold leading-6 text-slate-900">{question.questionText}</p>
                                                                        <p className="mt-1.5 text-[13px] text-slate-400">
                                                                            {t('questionTime', {
                                                                                time: formatDuration(question.displayAtSeconds),
                                                                                type: getInteractiveQuestionTypeLabel(question.questionType, t),
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                        isQuestionAnswered(question.id)
                                                                            ? 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                        {isQuestionAnswered(question.id) ? t('answered') : t('pending')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {activeLesson.lessonQuiz && (
                            <div className="overflow-hidden rounded-[24px] border border-violet-200 bg-[linear-gradient(180deg,#fcf8ff_0%,#faf6ff_100%)] shadow-[0_18px_48px_rgba(139,92,246,0.08)]">
                                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{t('quizTitle')}</h3>
                                            <p className="text-sm text-slate-500">
                                                {t('quizSummary', {
                                                    passing: activeLesson.lessonQuiz.passingScorePercent,
                                                    questions: activeLesson.lessonQuiz.questionsCount,
                                                })}
                                                {activeLesson.lessonQuiz.maxAttempts
                                                    ? t('quizAttemptsLimited', { count: activeLesson.lessonQuiz.maxAttempts })
                                                    : t('quizAttemptsUnlimited')}
                                            </p>
                                            {activeLesson.lessonQuiz.latestAttempt && (
                                                <p className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    activeLesson.lessonQuiz.latestAttempt.isPassed
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {activeLesson.lessonQuiz.latestAttempt.isPassed
                                                        ? t('quizLatestPassed', { score: Math.round(activeLesson.lessonQuiz.latestAttempt.scorePercent) })
                                                        : t('quizLatestFailed', { score: Math.round(activeLesson.lessonQuiz.latestAttempt.scorePercent) })}
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs text-slate-500">
                                                {t('quizAttemptsUsed', {
                                                    used: activeLesson.lessonQuiz.attemptsUsed ?? 0,
                                                    remaining: activeLesson.lessonQuiz.remainingAttempts ?? t('quizUnlimitedShort'),
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void handleOpenLessonQuiz()}
                                        disabled={isQuizLoading || isQuizSubmitting || isLessonQuizExhausted || !isLessonQuizReady}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <PlayCircle className="h-4 w-4" />
                                        {isLessonQuizExhausted
                                            ? t('quizAttemptsExhaustedShort')
                                            : !isLessonQuizReady
                                                ? t('quizLockedUntilLessonReady')
                                                : activeLesson.lessonQuiz.latestAttempt
                                                    ? t('retakeQuiz')
                                                    : t('startQuiz')}
                                    </button>
                                </div>
                                {lessonQuizResult && (
                                    <div className={`mx-5 mb-5 rounded-2xl border px-4 py-4 text-sm sm:mx-6 ${
                                        lessonQuizResult.isPassed
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                            : 'border-rose-200 bg-rose-50 text-rose-800'
                                    }`}>
                                        <p className="font-semibold">
                                            {lessonQuizResult.isPassed ? t('quizResultPassed') : t('quizResultFailed')}
                                        </p>
                                        <p className="mt-1">
                                            {t('quizResultSummary', {
                                                score: Math.round(lessonQuizResult.scorePercent),
                                                obtained: lessonQuizResult.scoreObtained,
                                                total: lessonQuizResult.totalScore,
                                            })}
                                        </p>
                                    </div>
                                )}
                                {isQuizPanelOpen && (
                                    <div className="border-t border-violet-200/70 bg-white/70 px-5 py-5 sm:px-6">
                                        {isQuizLoading ? (
                                            <div className="rounded-2xl border border-violet-100 bg-white px-4 py-8 text-center text-sm text-slate-500">
                                                {t('quizLoading')}
                                            </div>
                                        ) : lessonQuizRuntime ? (
                                            <div className="space-y-5">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900">{t('quizQuestionsTitle')}</h4>
                                                        <p className="text-sm text-slate-500">
                                                            {t('quizQuestionsSummary', {
                                                                count: lessonQuizRuntime.questions.length,
                                                                passing: lessonQuizRuntime.passingScorePercent,
                                                            })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsQuizPanelOpen(false)}
                                                        className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                                                    >
                                                        {t('quizCollapse')}
                                                    </button>
                                                </div>

                                                {lessonQuizError && (
                                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                        {lessonQuizError}
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    {lessonQuizRuntime.questions.map((question, index) => (
                                                        <div key={question.id} className="rounded-2xl border border-violet-100 bg-white px-4 py-4 shadow-sm">
                                                            <p className="text-sm font-semibold text-violet-700">
                                                                {t('quizQuestionLabel', { number: index + 1 })}
                                                            </p>
                                                            <h5 className="mt-1 text-base font-semibold text-slate-900">
                                                                {question.questionText}
                                                            </h5>

                                                            {question.questionType === 'SHORT_ANSWER' ? (
                                                                <textarea
                                                                    value={lessonQuizAnswers[question.id] ?? ''}
                                                                    onChange={(event) => handleLessonQuizAnswerChange(question.id, event.target.value)}
                                                                    rows={4}
                                                                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                                                                    placeholder={t('quizShortAnswerPlaceholder')}
                                                                />
                                                            ) : (
                                                                <div className="mt-3 space-y-2">
                                                                    {question.options.map((option) => {
                                                                        const isSelected = (lessonQuizAnswers[question.id] ?? '') === option.id;
                                                                        return (
                                                                            <button
                                                                                key={option.id}
                                                                                type="button"
                                                                                onClick={() => handleLessonQuizAnswerChange(question.id, option.id)}
                                                                                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                                                                    isSelected
                                                                                        ? 'border-violet-300 bg-violet-50 text-violet-900'
                                                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                                                }`}
                                                                            >
                                                                                <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold ${
                                                                                    isSelected
                                                                                        ? 'border-violet-400 bg-violet-500 text-white'
                                                                                        : 'border-slate-300 text-slate-500'
                                                                                }`}>
                                                                                    {isSelected ? '✓' : ''}
                                                                                </span>
                                                                                <span>{option.text}</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsQuizPanelOpen(false)}
                                                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                                                    >
                                                        {t('quizCollapse')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleSubmitLessonQuiz()}
                                                        disabled={isQuizSubmitting}
                                                        className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.18)] transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {isQuizSubmitting ? t('quizSubmitting') : t('quizSubmit')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                                                {t('quizLoadFailed')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <InteractivePromptModal
                question={activeQuestion}
                selectedOptionId={selectedOptionId}
                writtenAnswer={writtenAnswer}
                submitError={submitError}
                isSubmitting={isAnswerSubmitting}
                onSelectOption={setSelectedOptionId}
                onWrittenAnswerChange={setWrittenAnswer}
                onSubmit={() => void handleSubmitInteractive()}
            />
        </section>
    );
};

export default CourseLearningArea;
