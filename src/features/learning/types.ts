// Learning Types for Pharmacy Academy LMS

/**
 * ประเภทเนื้อหาบทเรียน
 */
export type LessonContentType = 'video' | 'document' | 'quiz' | 'assignment';

/**
 * สถานะบทเรียน
 */
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/**
 * ข้อมูลวิดีโอ
 */
export interface VideoContent {
    url: string;
    duration: number; // seconds
    thumbnail?: string;
    captions?: {
        language: string;
        url: string;
    }[];
}

/**
 * ข้อมูลเอกสาร
 */
export interface DocumentContent {
    url: string;
    type: 'pdf' | 'doc' | 'ppt';
    pages?: number;
}

/**
 * คำถาม Quiz
 */
export interface QuizQuestion {
    id: number;
    question: string;
    type: 'single' | 'multiple';
    options: {
        id: string;
        text: string;
    }[];
    correctAnswers: string[];
    explanation?: string;
}

/**
 * Quiz Content
 */
export interface QuizContent {
    questions: QuizQuestion[];
    passingScore: number; // percentage
    timeLimit?: number; // minutes
    allowRetry: boolean;
    maxAttempts?: number;
}

/**
 * บทเรียน
 */
export interface Lesson {
    id: number;
    title: string;
    description?: string;
    type: LessonContentType;
    duration: number; // minutes
    status: LessonStatus;
    content: VideoContent | DocumentContent | QuizContent;
    isPreview?: boolean;
}

/**
 * Section (กลุ่มบทเรียน)
 */
export interface Section {
    id: number;
    title: string;
    description?: string;
    lessons: Lesson[];
    duration: number; // total minutes
}

/**
 * ความคืบหน้าบทเรียน
 */
export interface LessonProgress {
    lessonId: number;
    status: LessonStatus;
    watchedDuration?: number; // seconds for video
    completedAt?: string;
    quizScore?: number;
    quizAttempts?: number;
}

/**
 * ความคืบหน้าคอร์ส (in Learning context)
 */
export interface LearningProgress {
    courseId: number;
    enrolledAt: string;
    lastAccessedAt: string;
    currentLessonId?: number;
    completedLessons: number[];
    totalLessons: number;
    progressPercent: number;
    lessonsProgress: LessonProgress[];
}

/**
 * CPE Certificate
 */
export interface CPECertificate {
    id: string;
    courseId: number;
    courseTitle: string;
    userId: number;
    userName: string;
    pharmacistLicense: string;
    cpeCredits: number;
    issuedAt: string;
    certificateUrl: string;
}

/**
 * Video Player State
 */
export interface VideoPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
    isFullscreen: boolean;
}

/**
 * Note (บันทึกย่อ)
 */
export interface LessonNote {
    id: number;
    lessonId: number;
    timestamp?: number; // seconds
    content: string;
    createdAt: string;
    updatedAt: string;
}

export type LearningQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface LearningInteractiveOption {
    id: string;
    text: string;
}

export interface LearningInteractiveQuestion {
    id: number;
    lessonId: number;
    questionText: string;
    questionType: LearningQuestionType;
    displayAtSeconds: number;
    sortOrder: number;
    options: LearningInteractiveOption[];
    answered: boolean;
}

export interface LearningLessonVideo {
    id: number;
    provider: string;
    resourceId: string;
    duration: number;
    name?: string | null;
    status: 'PROCESSING' | 'READY' | 'FAILED';
    playbackUrl: string | null;
}

export interface LearningLessonDocument {
    id: number;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    fileUrl: string;
}

export interface LearningLessonQuizSummary {
    id: number;
    passingScorePercent: number;
    maxAttempts?: number | null;
    questionsCount: number;
}

export interface LearningLessonProgressSnapshot {
    lastWatchedSeconds: number;
    isCompleted: boolean;
}

export interface LearningLessonData {
    id: number;
    title: string;
    sequenceOrder: number;
    status: 'locked' | 'available' | 'completed';
    video: LearningLessonVideo | null;
    documents: LearningLessonDocument[];
    interactiveQuestions: LearningInteractiveQuestion[];
    lessonQuiz: LearningLessonQuizSummary | null;
    progress: LearningLessonProgressSnapshot;
}

export interface LearningCourseData {
    id: number;
    title: string;
    description?: string | null;
    authorName?: string | null;
    thumbnail?: string | null;
    hasCertificate: boolean;
    cpeCredits: number;
    enrolledAt: string;
    lastAccessedAt?: string | null;
    progressPercent: number;
    completedLessons: number[];
    lastAccessedLessonId?: number | null;
    currentLessonId?: number | null;
    lessons: LearningLessonData[];
}

export interface CourseProgressResponse {
    courseId: number;
    completedLessons: number[];
    lastAccessedLessonId?: number;
    progressPercent: number;
    startedAt: string;
    lastAccessedAt: string;
}

export interface InteractiveAnswerResponse {
    id: number;
    videoQuestionId: number;
    answerGiven: string;
    answered: boolean;
    updatedAt?: string | null;
}
