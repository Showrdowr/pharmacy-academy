'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/lib/api';
import {
    calculateCourseWatchPercent,
    calculateWatchPercent,
    canRenderLessonVideo,
    formatDuration,
    getInteractiveRuntimeStatus,
    getNextPendingInteractive,
    getVideoAvailabilityMessage,
    normalizePlaybackSecond,
} from '../interactive-runtime';
import { learningApi } from '../services/learningApi';
import { InteractivePromptModal } from './InteractivePromptModal';
import { VimeoLessonPlayer, type VimeoLessonPlayerInstance } from './VimeoLessonPlayer';
import type {
    LearningCourseData,
    LearningInteractiveQuestion,
    LearningLessonData,
    LearningLessonDocument,
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

function getLessonErrorNotice(error: unknown) {
    if (!isApiError(error)) {
        return null;
    }

    switch (error.code) {
        case 'INTERACTIVE_INCOMPLETE':
            return 'ยังมีคำถาม interactive ค้างอยู่ กรุณาตอบให้ครบก่อนจบบทเรียน';
        case 'LESSON_VIDEO_INCOMPLETE':
        case 'LESSON_LOCKED':
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

function logInteractiveDebug(event: string, payload?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    console.info('[interactive]', event, payload || {});
}

const CourseLearningArea = () => {
    const SEEK_AHEAD_TOLERANCE_SECONDS = 2;
    const NATURAL_PLAYBACK_GRACE_SECONDS = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
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

    const previewLessonDocument = useCallback(async (lessonDocument: LearningLessonDocument) => {
        if (typeof window === 'undefined' || !lessonDocument.fileUrl) {
            return;
        }

        const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (!previewWindow) {
            setLessonNotice('เบราว์เซอร์บล็อกการเปิดเอกสาร กรุณาอนุญาต pop-up แล้วลองใหม่');
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
            setLessonNotice('ไม่สามารถเปิดเอกสารได้ กรุณาลองใหม่อีกครั้ง');
        }
    }, []);

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
            setLessonNotice('ไม่สามารถดาวน์โหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง');
        }
    }, []);

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
        setLessonNotice('ไม่สามารถกรอข้ามวิดีโอได้ กรุณาเรียนตามลำดับเวลา');
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
            setPageError('ไม่พบรหัสคอร์สที่ต้องการเรียน');
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

            setPageError(getApiErrorMessage(error, 'โหลดข้อมูลการเรียนไม่สำเร็จ'));
        } finally {
            setIsLoading(false);
        }
    }, [courseId, router]);

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

            const lessonErrorNotice = getLessonErrorNotice(error);
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
                setPageError(getApiErrorMessage(error, 'คุณไม่มีสิทธิ์เข้าถึงบทเรียนนี้'));
            } else {
                setPageError(getApiErrorMessage(error, 'บันทึกการจบบทเรียนไม่สำเร็จ'));
            }
        } finally {
            setIsCompletingLesson(false);
        }
    }, [course, isCompletingLesson, loadCourseLearning, maybeOpenInteractive, persistProgress, router]);

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
            setSubmitError('กรุณาตอบคำถามก่อนเรียนต่อ');
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
                setSubmitError(getApiErrorMessage(error, 'ส่งคำตอบไม่สำเร็จ'));
            }
        } finally {
            setIsAnswerSubmitting(false);
        }
    };

    const isQuestionAnswered = (questionId: number) => answeredIds.has(questionId);
    const interactiveStatus = useMemo(() => getInteractiveRuntimeStatus({
        lesson: activeLesson,
        activeQuestion,
        answeredCount: answeredIds.size,
        currentTime,
        lessonNotice,
        nextPendingInteractive,
    }), [activeLesson, activeQuestion, answeredIds.size, currentTime, lessonNotice, nextPendingInteractive]);

    if (isLoading || isAuthLoading) {
        return (
            <section className="flex min-h-[70vh] items-center justify-center" style={{ background: 'linear-gradient(135deg, #f7faf9 0%, #edf7f4 100%)' }}>
                <div className="text-center">
                    <div className="relative mx-auto h-16 w-16">
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#004736]" />
                        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-[#40C7A9]" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                    <p className="mt-5 text-sm font-medium text-slate-500">กำลังโหลดเนื้อหาการเรียน</p>
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
                        <h2 className="text-center text-2xl font-bold text-slate-900">เข้าเรียนไม่ได้</h2>
                        <p className="mt-2 text-center text-slate-500">{pageError || 'ไม่พบข้อมูลคอร์สที่ต้องการเรียน'}</p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link href="/courses-grid" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#004736] to-[#006650] px-6 py-3 font-semibold text-white shadow-md shadow-[#004736]/20 transition-all hover:shadow-lg">
                                กลับไปหน้าคอร์ส
                            </Link>
                            <Link href="/profile" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50">
                                ไปที่โปรไฟล์
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10" style={{ background: '#f7faf9', minHeight: '100vh' }}>
            <div
                className={`container transition-[filter] ${isInteractiveModalOpen ? 'pointer-events-none select-none' : ''}`}
                aria-hidden={isInteractiveModalOpen}
            >
                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#003d2e] via-[#004736] to-[#005a45] text-white shadow-xl">
                            <div className="px-5 pt-5 pb-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-300/80">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    กำลังเรียนอยู่
                                </div>
                                <h1 className="mt-2 text-lg font-bold leading-snug">{course.title}</h1>
                                <p className="mt-1.5 text-sm text-white/60">ผู้สอน: {course.authorName || 'ไม่ระบุ'}</p>
                            </div>
                            <div className="mx-4 mb-4 rounded-xl bg-white/[0.08] backdrop-blur-sm p-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                                            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                                            <circle cx="28" cy="28" r="24" fill="none" stroke="#40C7A9" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${roundedCourseWatchPercent * 1.508} 150.8`} className="transition-all duration-700" />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{roundedCourseWatchPercent}%</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white/90">ความคืบหน้า</p>
                                        <p className="mt-0.5 text-xs text-white/60">
                                            จบแล้ว {course.completedLessons.length}/{course.lessons.length} บท ({roundedCourseCompletionPercent}%)
                                        </p>
                                        <div className="mt-2 h-1.5 rounded-full bg-white/15">
                                            <div className="h-1.5 rounded-full bg-[#40C7A9] transition-all duration-500" style={{ width: `${roundedCourseCompletionPercent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <h2 className="text-sm font-bold text-slate-800">บทเรียนทั้งหมด</h2>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{course.lessons.length} บท</span>
                            </div>
                            <div className="max-h-[calc(100vh-380px)] space-y-1 overflow-y-auto p-2">
                                {course.lessons.map((lesson) => {
                                    const isActive = lesson.id === activeLesson.id;
                                    const isLocked = lesson.status === 'locked';
                                    const isCompleted = lesson.status === 'completed';

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect(lesson)}
                                            disabled={isLocked}
                                            className={`group w-full rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-[#edf7f4] ring-1 ring-[#004736]/30 shadow-sm'
                                                    : isLocked
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                    isCompleted
                                                        ? 'bg-emerald-500 text-white'
                                                        : isActive
                                                            ? 'bg-[#004736] text-white'
                                                            : isLocked
                                                                ? 'bg-slate-200 text-slate-400'
                                                                : 'bg-slate-100 text-slate-500 group-hover:bg-[#004736]/10 group-hover:text-[#004736]'
                                                }`}>
                                                    {isCompleted ? '✓' : lesson.sequenceOrder}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm font-semibold leading-snug ${
                                                        isActive ? 'text-[#004736]' : isLocked ? 'text-slate-400' : 'text-slate-800'
                                                    }`}>
                                                        {lesson.title}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {isLocked
                                                            ? 'ล็อก'
                                                            : `${lesson.video ? formatDuration(lesson.video.duration) : 'ไม่มีวิดีโอ'} • ${lesson.documents.length} เอกสาร`}
                                                    </p>
                                                </div>
                                                {isCompleted && <span className="mt-1 text-xs font-semibold text-emerald-600">จบแล้ว</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <main className="space-y-6">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#004736]">บทที่ {activeLesson.sequenceOrder}</p>
                                    <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{activeLesson.title}</h2>
                                    <p className="mt-2 max-w-2xl text-slate-500">{course.description || 'เรียนผ่านวิดีโอ เอกสารประกอบ และคำถาม interactive ระหว่างบทเรียน'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        {formatDuration(activeLesson.video?.duration)}
                                    </span>
                                    {course.hasCertificate && (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                                            Certificate
                                        </span>
                                    )}
                                    {course.cpeCredits > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>
                                            {course.cpeCredits} CPE
                                        </span>
                                    )}
                                </div>
                            </div>

                            {playableVideo ? (
                                <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-lg ring-1 ring-black/5">
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
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-16 text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">{getVideoAvailabilityMessage(activeLesson.video?.status, activeLesson.video?.duration)}</p>
                                </div>
                            )}

                            <div className="mt-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-5 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004736]"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            ดูไปแล้ว {formatDuration(currentTime)} ({roundedActiveLessonWatchPercent}%)
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                                            Interactive {activeLesson.interactiveQuestions.filter((question) => question.answered).length}/{activeLesson.interactiveQuestions.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => void maybeCompleteLesson()}
                                        disabled={
                                            isCompletingLesson
                                            || activeLesson.progress.isCompleted
                                            || !canRenderLessonVideo(activeLesson.video)
                                            || roundedActiveLessonWatchPercent < 100
                                        }
                                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                            activeLesson.progress.isCompleted
                                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : 'bg-gradient-to-r from-[#004736] to-[#006650] text-white shadow-md shadow-[#004736]/20 hover:shadow-lg hover:shadow-[#004736]/30'
                                        }`}
                                    >
                                        {activeLesson.progress.isCompleted
                                            ? '✓ บทเรียนนี้จบแล้ว'
                                            : isCompletingLesson
                                                ? 'กำลังบันทึก...'
                                                : activeLesson.video?.status === 'PROCESSING' || Number(activeLesson.video?.duration ?? 0) <= 0
                                                    ? 'รอวิดีโอประมวลผลก่อน'
                                                : activeLesson.video?.status === 'FAILED'
                                                        ? 'วิดีโอมีปัญหา'
                                                : roundedActiveLessonWatchPercent < 100
                                                    ? 'ต้องดูวิดีโอให้จบก่อน'
                                                : 'บันทึกว่าจบบทเรียน'}
                                    </button>
                                </div>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                                        <span>ความคืบหน้าบทเรียน</span>
                                        <span className="font-semibold text-slate-600">{roundedActiveLessonWatchPercent}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-[#004736] to-[#40C7A9] transition-all duration-500"
                                            style={{ width: `${roundedActiveLessonWatchPercent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {interactiveStatus && (
                                <div className={`mt-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
                                    interactiveStatus.tone === 'emerald'
                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                        : interactiveStatus.tone === 'amber'
                                            ? 'border border-amber-200 bg-amber-50 text-amber-800'
                                            : interactiveStatus.tone === 'sky'
                                                ? 'border border-sky-200 bg-sky-50 text-sky-800'
                                                : 'border border-slate-200 bg-slate-50 text-slate-700'
                                }`}>
                                    {interactiveStatus.tone === 'emerald' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                                    {interactiveStatus.tone === 'amber' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>}
                                    {interactiveStatus.message}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#004736]/10">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004736]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">เอกสารประกอบบทเรียน</h3>
                                        <p className="text-xs text-slate-400">{activeLesson.documents.length} ไฟล์</p>
                                    </div>
                                </div>
                                <div className="space-y-2 p-3">
                                    {activeLesson.documents.length === 0 ? (
                                        <div className="px-3 py-6 text-center">
                                            <p className="text-sm text-slate-400">ยังไม่มีเอกสารในบทเรียนนี้</p>
                                        </div>
                                    ) : (
                                        activeLesson.documents.map((document) => (
                                            <div
                                                key={document.id}
                                                className="group flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 px-4 py-3 transition-all hover:border-[#004736]/20 hover:bg-[#edf7f4] hover:shadow-sm"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => void downloadLessonDocument(document)}
                                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-colors hover:bg-[#edf7f4]"
                                                    aria-label={`ดาวน์โหลดเอกสาร ${document.fileName}`}
                                                    title="ดาวน์โหลดเอกสาร"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 transition-colors group-hover:text-[#004736]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-[#004736]">{document.fileName}</p>
                                                    <p className="text-xs text-slate-400">{document.mimeType} • {formatFileSize(document.sizeBytes)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => void previewLessonDocument(document)}
                                                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white hover:text-[#004736]"
                                                    aria-label={`เปิดเอกสาร ${document.fileName}`}
                                                    title="เปิดเอกสารในแท็บใหม่"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Interactive ระหว่างวิดีโอ</h3>
                                        <p className="text-xs text-slate-400">{activeLesson.interactiveQuestions.filter((q) => q.answered).length}/{activeLesson.interactiveQuestions.length} ตอบแล้ว</p>
                                    </div>
                                </div>
                                <div className="space-y-2 p-3">
                                    {activeLesson.interactiveQuestions.length === 0 ? (
                                        <div className="px-3 py-6 text-center">
                                            <p className="text-sm text-slate-400">บทเรียนนี้ยังไม่มีคำถาม interactive</p>
                                        </div>
                                    ) : (
                                        activeLesson.interactiveQuestions.map((question) => (
                                            <div key={question.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                                                isQuestionAnswered(question.id)
                                                    ? 'bg-emerald-50/60 border border-emerald-100'
                                                    : 'bg-slate-50 border border-transparent'
                                            }`}>
                                                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                    isQuestionAnswered(question.id)
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {isQuestionAnswered(question.id) ? '✓' : '?'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-800">{question.questionText}</p>
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        เวลา {formatDuration(question.displayAtSeconds)} • {question.questionType}
                                                    </p>
                                                </div>
                                                <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    isQuestionAnswered(question.id)
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {isQuestionAnswered(question.id) ? 'ตอบแล้ว' : 'รอตอบ'}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {activeLesson.lessonQuiz && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                <div className="flex items-center gap-3 px-5 py-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Quiz ท้ายบท</h3>
                                        <p className="text-sm text-slate-500">
                                            คะแนนผ่าน {activeLesson.lessonQuiz.passingScorePercent}% • {activeLesson.lessonQuiz.questionsCount} ข้อ
                                            {activeLesson.lessonQuiz.maxAttempts ? ` • จำกัด ${activeLesson.lessonQuiz.maxAttempts} ครั้ง` : ' • ไม่จำกัดจำนวนครั้ง'}
                                        </p>
                                    </div>
                                </div>
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
