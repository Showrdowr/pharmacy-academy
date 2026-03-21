import type {
    LearningCourseData,
    LearningInteractiveOption,
    LearningInteractiveQuestion,
    LearningLessonData,
    LearningLessonDocument,
    LearningLessonProgressSnapshot,
    LearningLessonQuizSummary,
    LearningLessonVideo,
} from '@/features/learning/types';

export function createInteractiveOptionFixture(overrides: Partial<LearningInteractiveOption> = {}): LearningInteractiveOption {
    return {
        id: 'option-1',
        text: 'ตัวเลือกที่ 1',
        ...overrides,
    };
}

export function createInteractiveQuestionFixture(
    overrides: Partial<LearningInteractiveQuestion> = {}
): LearningInteractiveQuestion {
    const defaultOptions = [
        createInteractiveOptionFixture({ id: 'option-a', text: 'คำตอบ A' }),
        createInteractiveOptionFixture({ id: 'option-b', text: 'คำตอบ B' }),
    ];

    return {
        id: 1,
        lessonId: 1,
        questionText: 'คำถาม interactive ตัวอย่าง',
        questionType: 'MULTIPLE_CHOICE',
        displayAtSeconds: 120,
        sortOrder: 1,
        options: overrides.options ?? defaultOptions,
        answered: false,
        ...overrides,
    };
}

export function createLessonVideoFixture(overrides: Partial<LearningLessonVideo> = {}): LearningLessonVideo {
    return {
        id: 1,
        provider: 'VIMEO',
        resourceId: '1175386748',
        duration: 600,
        name: 'Lesson video',
        status: 'READY',
        playbackUrl: 'https://player.vimeo.com/video/1175386748?h=testhash',
        ...overrides,
    };
}

export function createLessonDocumentFixture(overrides: Partial<LearningLessonDocument> = {}): LearningLessonDocument {
    return {
        id: 1,
        fileName: 'handout.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        fileUrl: '/files/handout.pdf',
        ...overrides,
    };
}

export function createLessonProgressFixture(
    overrides: Partial<LearningLessonProgressSnapshot> = {}
): LearningLessonProgressSnapshot {
    return {
        lastWatchedSeconds: 0,
        isCompleted: false,
        ...overrides,
    };
}

export function createLessonQuizSummaryFixture(
    overrides: Partial<LearningLessonQuizSummary> = {}
): LearningLessonQuizSummary {
    return {
        id: 1,
        passingScorePercent: 80,
        maxAttempts: null,
        questionsCount: 10,
        ...overrides,
    };
}

export function createLessonFixture(
    overrides: Partial<LearningLessonData> = {}
): LearningLessonData {
    const video = overrides.video === undefined ? createLessonVideoFixture() : overrides.video;
    const progress = createLessonProgressFixture(overrides.progress);
    const documents = overrides.documents ?? [];
    const interactiveQuestions = overrides.interactiveQuestions ?? [];
    const lessonQuiz = overrides.lessonQuiz === undefined ? null : overrides.lessonQuiz;

    return {
        id: 1,
        title: 'บทเรียนตัวอย่าง',
        sequenceOrder: 1,
        status: 'available',
        video,
        documents,
        interactiveQuestions,
        lessonQuiz,
        progress,
        ...overrides,
    };
}

export function createLearningCourseFixture(
    overrides: Partial<LearningCourseData> = {}
): LearningCourseData {
    const lessons = overrides.lessons ?? [createLessonFixture()];
    const currentLessonId = overrides.currentLessonId ?? lessons[0]?.id ?? null;
    const lastAccessedLessonId = overrides.lastAccessedLessonId ?? lessons[0]?.id ?? null;
    const completedLessons = overrides.completedLessons ?? [];

    return {
        id: 12,
        title: 'คอร์สตัวอย่าง',
        description: 'คำอธิบายคอร์ส',
        authorName: 'อาจารย์ตัวอย่าง',
        thumbnail: null,
        hasCertificate: false,
        cpeCredits: 0,
        enrolledAt: '2026-03-01T00:00:00.000Z',
        lastAccessedAt: '2026-03-01T00:00:00.000Z',
        progressPercent: 0,
        completedLessons,
        lastAccessedLessonId,
        currentLessonId,
        lessons,
        ...overrides,
    };
}
