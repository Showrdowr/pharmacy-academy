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
    const courseWatchPercent = useMemo(
        () => calculateCourseWatchPercent(course, { activeLessonId, currentTime }),
        [course, activeLessonId, currentTime]
    );
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
    const roundedCourseCompletionPercent = Math.round(Number(course?.progressPercent ?? 0));
    const roundedActiveLessonWatchPercent = Math.round(activeLessonWatchPercent);

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
            <section className="py-16" style={{ background: '#f7faf9', minHeight: '70vh' }}>
                <div className="container text-center">
                    <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-[#004736]" />
                    <p className="mt-4 text-slate-600">กำลังโหลดเนื้อหาการเรียน</p>
                </div>
            </section>
        );
    }

    if (pageError || !course || !activeLesson) {
        return (
            <section className="py-16" style={{ background: '#f7faf9', minHeight: '70vh' }}>
                <div className="container max-w-3xl">
                    <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900">เข้าเรียนไม่ได้</h2>
                        <p className="mt-3 text-slate-600">{pageError || 'ไม่พบข้อมูลคอร์สที่ต้องการเรียน'}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/courses-grid" className="rounded-xl bg-[#004736] px-5 py-3 font-semibold text-white">
                                กลับไปหน้าคอร์ส
                            </Link>
                            <Link href="/profile" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
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
                    <aside className="space-y-5">
                        <div className="rounded-3xl bg-[#004736] p-6 text-white shadow-lg">
                            <p className="text-sm text-white/80">กำลังเรียนอยู่</p>
                            <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
                            <p className="mt-3 text-sm text-white/80">ผู้สอน: {course.authorName || 'ไม่ระบุ'}</p>
                            <div className="mt-5 rounded-2xl bg-white/10 p-4">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span>ความคืบหน้าการรับชม</span>
                                    <span>{roundedCourseWatchPercent}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/20">
                                    <div className="h-2 rounded-full bg-[#40C7A9]" style={{ width: `${roundedCourseWatchPercent}%` }} />
                                </div>
                                <p className="mt-3 text-xs text-white/75">
                                    จบบทเรียนแล้ว {roundedCourseCompletionPercent}% • {course.completedLessons.length}/{course.lessons.length} บท
                                </p>
                                <p className="mt-1 text-xs text-white/60">
                                    เรียนจบแล้ว {course.completedLessons.length}/{course.lessons.length} บท
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">บทเรียน</h2>
                                <span className="text-sm text-slate-500">{course.lessons.length} บท</span>
                            </div>
                            <div className="space-y-2">
                                {course.lessons.map((lesson) => {
                                    const isActive = lesson.id === activeLesson.id;
                                    const isLocked = lesson.status === 'locked';
                                    const isCompleted = lesson.status === 'completed';

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect(lesson)}
                                            disabled={isLocked}
                                            className={`w-full rounded-2xl border p-4 text-left transition ${
                                                isActive
                                                    ? 'border-[#004736] bg-[#edf7f4] shadow-sm'
                                                    : isLocked
                                                        ? 'border-slate-200 bg-slate-50 text-slate-400'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {lesson.sequenceOrder}. {lesson.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {lesson.video ? formatDuration(lesson.video.duration) : 'ไม่มีวิดีโอ'} • {lesson.documents.length} เอกสาร
                                                    </p>
                                                </div>
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                    isCompleted
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : isLocked
                                                            ? 'bg-slate-200 text-slate-500'
                                                            : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {isCompleted ? 'จบแล้ว' : isLocked ? 'ล็อก' : 'พร้อมเรียน'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <main className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#004736]">บทที่ {activeLesson.sequenceOrder}</p>
                                    <h2 className="mt-1 text-3xl font-bold text-slate-900">{activeLesson.title}</h2>
                                    <p className="mt-2 text-slate-600">{course.description || 'เรียนผ่านวิดีโอ เอกสารประกอบ และคำถาม interactive ระหว่างบทเรียน'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                                        เวลา {formatDuration(activeLesson.video?.duration)}
                                    </span>
                                    {course.hasCertificate && (
                                        <span className="rounded-full bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
                                            มี Certificate
                                        </span>
                                    )}
                                    {course.cpeCredits > 0 && (
                                        <span className="rounded-full bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700">
                                            {course.cpeCredits} CPE
                                        </span>
                                    )}
                                </div>
                            </div>

                            {playableVideo ? (
                                <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-lg">
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
                                            disableForwardSeekUi
                                            interactionDisabled={isInteractiveModalOpen}
                                            onBlockedSeekControlInteraction={() => {
                                                setLessonNotice('ไม่สามารถกรอข้ามวิดีโอได้ กรุณาเรียนตามลำดับเวลา');
                                            }}
                                            playerRef={playerRef}
                                            onInitialTimeResolved={(seconds) => {
                                                const normalizedSeconds = normalizePlaybackSecond(seconds);
                                                currentTimeRef.current = normalizedSeconds;
                                                watchedSecondsByLessonRef.current.set(activeLesson.id, normalizedSeconds);
                                                maxReachedSecondsByLessonRef.current.set(
                                                    activeLesson.id,
                                                    Math.max(
                                                        maxReachedSecondsByLessonRef.current.get(activeLesson.id) ?? 0,
                                                        normalizedSeconds,
                                                    ),
                                                );
                                                setCurrentTime(normalizedSeconds);
                                                logInteractiveDebug('initial-position-resolved', {
                                                    lessonId: activeLesson.id,
                                                    seconds: normalizedSeconds,
                                                });
                                                void maybeOpenInteractive(normalizedSeconds);
                                            }}
                                            onTimeUpdate={(seconds) => {
                                                const normalizedSeconds = normalizePlaybackSecond(seconds);
                                                currentTimeRef.current = normalizedSeconds;
                                                watchedSecondsByLessonRef.current.set(activeLesson.id, normalizedSeconds);
                                                maxReachedSecondsByLessonRef.current.set(
                                                    activeLesson.id,
                                                    Math.max(
                                                        maxReachedSecondsByLessonRef.current.get(activeLesson.id) ?? 0,
                                                        normalizedSeconds,
                                                    ),
                                                );
                                                setCurrentTime(normalizedSeconds);
                                                void persistProgress(activeLesson.id, normalizedSeconds);
                                                void maybeOpenInteractive(normalizedSeconds);
                                            }}
                                            onSeeked={(seconds) => {
                                                const normalizedSeconds = normalizePlaybackSecond(seconds);
                                                const maxReachedSeconds = Math.max(
                                                    maxReachedSecondsByLessonRef.current.get(activeLesson.id)
                                                        ?? normalizePlaybackSecond(activeLesson.progress.lastWatchedSeconds || 0),
                                                    0,
                                                );
                                                const maxAllowedSeconds = maxReachedSeconds + SEEK_AHEAD_TOLERANCE_SECONDS;

                                                if (normalizedSeconds > maxAllowedSeconds) {
                                                    const rollbackSeconds = maxReachedSeconds;
                                                    currentTimeRef.current = rollbackSeconds;
                                                    watchedSecondsByLessonRef.current.set(activeLesson.id, rollbackSeconds);
                                                    setCurrentTime(rollbackSeconds);
                                                    setLessonNotice('ไม่สามารถกรอข้ามวิดีโอได้ กรุณาเรียนตามลำดับเวลา');
                                                    logInteractiveDebug('blocked-forward-seek', {
                                                        lessonId: activeLesson.id,
                                                        attemptedSeconds: normalizedSeconds,
                                                        rollbackSeconds,
                                                    });

                                                    void playerRef.current?.setCurrentTime(rollbackSeconds).catch(() => undefined);
                                                    void maybeOpenInteractive(rollbackSeconds);
                                                    return;
                                                }

                                                currentTimeRef.current = normalizedSeconds;
                                                watchedSecondsByLessonRef.current.set(activeLesson.id, normalizedSeconds);
                                                maxReachedSecondsByLessonRef.current.set(
                                                    activeLesson.id,
                                                    Math.max(maxReachedSeconds, normalizedSeconds),
                                                );
                                                setCurrentTime(normalizedSeconds);
                                                void persistProgress(activeLesson.id, normalizedSeconds, true);
                                                void maybeOpenInteractive(normalizedSeconds);
                                            }}
                                            onPause={(seconds) => {
                                                const resolvedSeconds = normalizePlaybackSecond(seconds || currentTimeRef.current || 0);
                                                watchedSecondsByLessonRef.current.set(activeLesson.id, resolvedSeconds);
                                                void persistProgress(activeLesson.id, resolvedSeconds, true);
                                            }}
                                            onEnded={() => {
                                                const duration = normalizePlaybackSecond(playableVideo.duration || currentTimeRef.current || 0);
                                                currentTimeRef.current = duration;
                                                watchedSecondsByLessonRef.current.set(activeLesson.id, duration);
                                                maxReachedSecondsByLessonRef.current.set(activeLesson.id, duration);
                                                setCurrentTime(duration);
                                                void persistProgress(activeLesson.id, duration, true);
                                                void maybeCompleteLesson();
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                                    {getVideoAvailabilityMessage(activeLesson.video?.status, activeLesson.video?.duration)}
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                                <div className="flex items-center gap-4">
                                    <span>ดูไปแล้ว {formatDuration(currentTime)} ({roundedActiveLessonWatchPercent}%)</span>
                                    <span>Interactive ตอบแล้ว {activeLesson.interactiveQuestions.filter((question) => question.answered).length}/{activeLesson.interactiveQuestions.length}</span>
                                </div>
                                <button
                                    onClick={() => void maybeCompleteLesson()}
                                    disabled={
                                        isCompletingLesson
                                        || activeLesson.progress.isCompleted
                                        || !canRenderLessonVideo(activeLesson.video)
                                        || roundedActiveLessonWatchPercent < 100
                                    }
                                    className="rounded-xl bg-[#004736] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {activeLesson.progress.isCompleted
                                        ? 'บทเรียนนี้จบแล้ว'
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
                            <div className="mt-3">
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    <span>Lesson Watch Progress</span>
                                    <span>{roundedActiveLessonWatchPercent}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-[#004736] transition-[width]"
                                        style={{ width: `${roundedActiveLessonWatchPercent}%` }}
                                    />
                                </div>
                            </div>

                            {interactiveStatus && (
                                <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                                    interactiveStatus.tone === 'emerald'
                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                        : interactiveStatus.tone === 'amber'
                                            ? 'border border-amber-200 bg-amber-50 text-amber-800'
                                            : interactiveStatus.tone === 'sky'
                                                ? 'border border-sky-200 bg-sky-50 text-sky-800'
                                                : 'border border-slate-200 bg-slate-50 text-slate-700'
                                }`}>
                                    {interactiveStatus.message}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">เอกสารประกอบบทเรียน</h3>
                                <div className="mt-4 space-y-3">
                                    {activeLesson.documents.length === 0 ? (
                                        <p className="text-sm text-slate-500">ยังไม่มีเอกสารในบทเรียนนี้</p>
                                    ) : (
                                        activeLesson.documents.map((document) => (
                                            <a
                                                key={document.id}
                                                href={document.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-100"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">{document.fileName}</p>
                                                    <p className="text-xs text-slate-500">{document.mimeType} • {formatFileSize(document.sizeBytes)}</p>
                                                </div>
                                                <span className="text-sm font-semibold text-[#004736]">ดาวน์โหลด</span>
                                            </a>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">Interactive ระหว่างวิดีโอ</h3>
                                <div className="mt-4 space-y-3">
                                    {activeLesson.interactiveQuestions.length === 0 ? (
                                        <p className="text-sm text-slate-500">บทเรียนนี้ยังไม่มีคำถาม interactive</p>
                                    ) : (
                                        activeLesson.interactiveQuestions.map((question) => (
                                            <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{question.questionText}</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            เวลา {formatDuration(question.displayAtSeconds)} • {question.questionType}
                                                        </p>
                                                    </div>
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        isQuestionAnswered(question.id)
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {isQuestionAnswered(question.id) ? 'ตอบแล้ว' : 'รอตอบ'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {activeLesson.lessonQuiz && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">สรุป Quiz ท้ายบท</h3>
                                <p className="mt-2 text-slate-600">
                                    คะแนนผ่าน {activeLesson.lessonQuiz.passingScorePercent}% • จำนวนคำถาม {activeLesson.lessonQuiz.questionsCount}
                                    {activeLesson.lessonQuiz.maxAttempts ? ` • จำกัด ${activeLesson.lessonQuiz.maxAttempts} ครั้ง` : ' • ไม่จำกัดจำนวนครั้ง'}
                                </p>
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
