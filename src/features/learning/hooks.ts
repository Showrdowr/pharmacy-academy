// Learning Hooks - Business logic for course learning
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
    Lesson,
    Section,
    LearningProgress,
    VideoPlayerState,
    LessonNote,
    QuizQuestion,
} from './types';

/**
 * useLearning hook
 * ใช้สำหรับจัดการหน้าเรียน
 */
export function useLearning(courseId: number) {
    const [sections, setSections] = useState<Section[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [progress, setProgress] = useState<LearningProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourseContent = async () => {
            setIsLoading(true);
            try {
                // TODO: Replace with actual API call
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Mock data
                setSections([]);
                setProgress(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchCourseContent();
        }
    }, [courseId]);

    const selectLesson = useCallback((lesson: Lesson) => {
        setCurrentLesson(lesson);
        // TODO: Update last accessed
    }, []);

    const markLessonComplete = useCallback(async (lessonId: number) => {
        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 300));

            setProgress((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    completedLessons: [...prev.completedLessons, lessonId],
                    progressPercent: ((prev.completedLessons.length + 1) / prev.totalLessons) * 100,
                };
            });
        } catch (err) {
            console.error('Failed to mark lesson complete:', err);
        }
    }, []);

    const getNextLesson = useCallback((): Lesson | null => {
        if (!currentLesson || sections.length === 0) return null;

        for (let i = 0; i < sections.length; i++) {
            const lessons = sections[i].lessons;
            const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);

            if (currentIndex !== -1) {
                // Next lesson in same section
                if (currentIndex < lessons.length - 1) {
                    return lessons[currentIndex + 1];
                }
                // First lesson of next section
                if (i < sections.length - 1) {
                    return sections[i + 1].lessons[0];
                }
            }
        }
        return null;
    }, [currentLesson, sections]);

    const getPreviousLesson = useCallback((): Lesson | null => {
        if (!currentLesson || sections.length === 0) return null;

        for (let i = 0; i < sections.length; i++) {
            const lessons = sections[i].lessons;
            const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);

            if (currentIndex !== -1) {
                // Previous lesson in same section
                if (currentIndex > 0) {
                    return lessons[currentIndex - 1];
                }
                // Last lesson of previous section
                if (i > 0) {
                    const prevLessons = sections[i - 1].lessons;
                    return prevLessons[prevLessons.length - 1];
                }
            }
        }
        return null;
    }, [currentLesson, sections]);

    return {
        sections,
        currentLesson,
        progress,
        isLoading,
        error,
        selectLesson,
        markLessonComplete,
        getNextLesson,
        getPreviousLesson,
    };
}

/**
 * useVideoPlayer hook
 * ใช้สำหรับ video player
 */
export function useVideoPlayer(onComplete?: () => void) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [state, setState] = useState<VideoPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        isFullscreen: false,
    });

    const play = useCallback(() => {
        videoRef.current?.play();
        setState((prev) => ({ ...prev, isPlaying: true }));
    }, []);

    const pause = useCallback(() => {
        videoRef.current?.pause();
        setState((prev) => ({ ...prev, isPlaying: false }));
    }, []);

    const togglePlay = useCallback(() => {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    }, [state.isPlaying, play, pause]);

    const seek = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setState((prev) => ({ ...prev, currentTime: time }));
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            setState((prev) => ({ ...prev, volume }));
        }
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setState((prev) => ({ ...prev, playbackRate: rate }));
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            videoRef.current?.requestFullscreen();
            setState((prev) => ({ ...prev, isFullscreen: true }));
        } else {
            document.exitFullscreen();
            setState((prev) => ({ ...prev, isFullscreen: false }));
        }
    }, []);

    // Event handlers for video element
    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            setState((prev) => ({
                ...prev,
                currentTime: videoRef.current!.currentTime,
            }));
        }
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) {
            setState((prev) => ({
                ...prev,
                duration: videoRef.current!.duration,
            }));
        }
    }, []);

    const handleEnded = useCallback(() => {
        setState((prev) => ({ ...prev, isPlaying: false }));
        onComplete?.();
    }, [onComplete]);

    return {
        videoRef,
        state,
        play,
        pause,
        togglePlay,
        seek,
        setVolume,
        setPlaybackRate,
        toggleFullscreen,
        handlers: {
            onTimeUpdate: handleTimeUpdate,
            onLoadedMetadata: handleLoadedMetadata,
            onEnded: handleEnded,
        },
    };
}

/**
 * useQuiz hook
 * ใช้สำหรับทำ quiz
 */
export function useQuiz(questions: QuizQuestion[], passingScore: number) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isPassed = score >= passingScore;

    const selectAnswer = useCallback((questionId: number, answerId: string, isMultiple: boolean) => {
        setAnswers((prev) => {
            if (isMultiple) {
                const current = prev[questionId] || [];
                if (current.includes(answerId)) {
                    return { ...prev, [questionId]: current.filter((a) => a !== answerId) };
                }
                return { ...prev, [questionId]: [...current, answerId] };
            }
            return { ...prev, [questionId]: [answerId] };
        });
    }, []);

    const goToNext = useCallback(() => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    }, [isLastQuestion]);

    const goToPrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    }, [currentQuestionIndex]);

    const submit = useCallback(() => {
        let correctCount = 0;

        questions.forEach((q) => {
            const userAnswers = answers[q.id] || [];
            const isCorrect =
                userAnswers.length === q.correctAnswers.length &&
                userAnswers.every((a) => q.correctAnswers.includes(a));
            if (isCorrect) correctCount++;
        });

        const calculatedScore = (correctCount / questions.length) * 100;
        setScore(calculatedScore);
        setIsSubmitted(true);
    }, [questions, answers]);

    const reset = useCallback(() => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsSubmitted(false);
        setScore(0);
    }, []);

    return {
        currentQuestion,
        currentQuestionIndex,
        totalQuestions: questions.length,
        answers,
        isSubmitted,
        score,
        isPassed,
        isLastQuestion,
        selectAnswer,
        goToNext,
        goToPrevious,
        submit,
        reset,
    };
}

/**
 * useNotes hook
 * ใช้สำหรับบันทึกย่อ
 */
export function useNotes(lessonId: number) {
    const [notes, setNotes] = useState<LessonNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                // TODO: Replace with actual API call
                await new Promise((resolve) => setTimeout(resolve, 300));
                setNotes([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) {
            fetchNotes();
        }
    }, [lessonId]);

    const addNote = useCallback(async (content: string, timestamp?: number) => {
        try {
            // TODO: Replace with actual API call
            const newNote: LessonNote = {
                id: Date.now(),
                lessonId,
                content,
                timestamp,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setNotes((prev) => [...prev, newNote]);
        } catch (err) {
            console.error('Failed to add note:', err);
        }
    }, [lessonId]);

    const deleteNote = useCallback(async (noteId: number) => {
        try {
            // TODO: Replace with actual API call
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    }, []);

    return {
        notes,
        isLoading,
        addNote,
        deleteNote,
    };
}
