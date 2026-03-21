import {
    calculateCourseWatchPercent,
    calculateWatchPercent,
    canRenderLessonVideo,
    getInteractiveRuntimeStatus,
    getNextPendingInteractive,
    getVideoAvailabilityMessage,
    normalizePlaybackSecond,
    sortInteractiveQuestions,
} from './interactive-runtime';
import {
    createInteractiveQuestionFixture,
    createLearningCourseFixture,
    createLessonFixture,
    createLessonVideoFixture,
} from '@/test/learning-fixtures';

describe('interactive-runtime', () => {
    it('sorts interactive questions by display time and sort order', () => {
        const sorted = sortInteractiveQuestions([
            createInteractiveQuestionFixture({ id: 3, displayAtSeconds: 180, sortOrder: 1 }),
            createInteractiveQuestionFixture({ id: 2, displayAtSeconds: 120, sortOrder: 2 }),
            createInteractiveQuestionFixture({ id: 1, displayAtSeconds: 120, sortOrder: 1 }),
        ]);

        expect(sorted.map((question) => question.id)).toEqual([1, 2, 3]);
    });

    it('returns the earliest unanswered interactive when current time has passed multiple questions', () => {
        const lesson = createLessonFixture({
            interactiveQuestions: [
                createInteractiveQuestionFixture({ id: 1, displayAtSeconds: 120, sortOrder: 2 }),
                createInteractiveQuestionFixture({ id: 2, displayAtSeconds: 120, sortOrder: 1 }),
                createInteractiveQuestionFixture({ id: 3, displayAtSeconds: 180, sortOrder: 1 }),
            ],
        });

        const nextQuestion = getNextPendingInteractive(lesson, new Set(), 181);

        expect(nextQuestion?.id).toBe(2);
    });

    it('requires a ready Vimeo playback URL before a lesson video is considered playable', () => {
        expect(canRenderLessonVideo(createLessonVideoFixture())).toBe(true);
        expect(canRenderLessonVideo(createLessonVideoFixture({ playbackUrl: null }))).toBe(false);
        expect(canRenderLessonVideo(createLessonVideoFixture({ status: 'PROCESSING' }))).toBe(false);
        expect(canRenderLessonVideo(createLessonVideoFixture({ duration: 0 }))).toBe(false);
    });

    it('returns a blocked runtime status when video is not ready', () => {
        const lesson = createLessonFixture({
            video: createLessonVideoFixture({ status: 'PROCESSING', playbackUrl: null }),
            interactiveQuestions: [createInteractiveQuestionFixture()],
        });

        expect(getInteractiveRuntimeStatus({
            lesson,
            activeQuestion: null,
            answeredCount: 0,
            currentTime: 0,
            lessonNotice: '',
            nextPendingInteractive: null,
        })).toEqual({
            tone: 'amber',
            message: 'วิดีโอยังไม่พร้อมใช้งานจริง จึงยังไม่สามารถ trigger คำถาม interactive ตามเวลาได้',
        });
    });

    it('returns next-question guidance when there is a future unanswered interactive', () => {
        const lesson = createLessonFixture({
            interactiveQuestions: [createInteractiveQuestionFixture({ displayAtSeconds: 120 })],
        });

        expect(getInteractiveRuntimeStatus({
            lesson,
            activeQuestion: null,
            answeredCount: 0,
            currentTime: 30,
            lessonNotice: '',
            nextPendingInteractive: createInteractiveQuestionFixture({ displayAtSeconds: 120 }),
        })).toEqual({
            tone: 'sky',
            message: 'คำถามถัดไปจะแสดงที่ 2:00',
        });
    });

    it('normalizes playback seconds and availability messages consistently', () => {
        expect(normalizePlaybackSecond(12.9)).toBe(12);
        expect(normalizePlaybackSecond(-5)).toBe(0);
        expect(getVideoAvailabilityMessage('FAILED', 10)).toContain('วิดีโอบทเรียนนี้มีปัญหา');
        expect(getVideoAvailabilityMessage('READY', 0)).toContain('ยังอยู่ระหว่างประมวลผล');
    });

    it('calculates watch percentages for lessons and the course from watched seconds', () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    id: 1,
                    progress: { lastWatchedSeconds: 300, isCompleted: false },
                    interactiveQuestions: [],
                }),
                createLessonFixture({
                    id: 2,
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                    interactiveQuestions: [],
                }),
            ],
        });

        expect(calculateWatchPercent(300, 600)).toBe(50);
        expect(calculateCourseWatchPercent(course, { activeLessonId: 1, currentTime: 300 })).toBe(25);
    });
});
