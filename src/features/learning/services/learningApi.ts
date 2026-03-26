import { api, toApiError } from '@/lib/api';
import type {
    CourseProgressResponse,
    InteractiveAnswerResponse,
    LearningCourseData,
    LearningLessonQuizAttemptResult,
    LearningLessonQuizRuntime,
    LearningLessonVideoSyncResult,
} from '../types';

export const learningApi = {
    async getCourseLearning(courseId: number): Promise<LearningCourseData> {
        const response = await api.get<LearningCourseData>(`/courses/${courseId}/learning`);
        if (!response.success) {
            throw toApiError(response, 'Failed to load course learning data');
        }

        return response.data;
    },

    async getCourseProgress(courseId: number): Promise<CourseProgressResponse> {
        const response = await api.get<CourseProgressResponse>(`/courses/${courseId}/progress`);
        if (!response.success) {
            throw toApiError(response, 'Failed to load course progress');
        }

        return response.data;
    },

    async syncLessonVideoStatus(courseId: number, lessonId: number): Promise<LearningLessonVideoSyncResult> {
        const response = await api.post<LearningLessonVideoSyncResult>(`/courses/${courseId}/lessons/${lessonId}/video-status/sync`);
        if (!response.success) {
            throw toApiError(response, 'Failed to sync lesson video status');
        }

        return response.data;
    },

    async submitVideoQuestionAnswer(questionId: number, answerGiven: string): Promise<InteractiveAnswerResponse> {
        const response = await api.post<InteractiveAnswerResponse>(`/video-questions/${questionId}/answer`, {
            answerGiven,
        });
        if (!response.success) {
            throw toApiError(response, 'Failed to submit interactive answer');
        }

        return response.data;
    },

    async getLessonQuizRuntime(lessonId: number): Promise<LearningLessonQuizRuntime> {
        const response = await api.get<LearningLessonQuizRuntime>(`/lessons/${lessonId}/quiz-runtime`);
        if (!response.success) {
            throw toApiError(response, 'Failed to load lesson quiz');
        }

        return response.data;
    },

    async submitLessonQuizAttempt(
        lessonId: number,
        answers: Array<{ questionId: number; answerGiven: string }>,
    ): Promise<LearningLessonQuizAttemptResult> {
        const response = await api.post<LearningLessonQuizAttemptResult>(`/lessons/${lessonId}/quiz-attempts`, {
            answers,
        });
        if (!response.success) {
            throw toApiError(response, 'Failed to submit lesson quiz');
        }

        return response.data;
    },

    async markLessonComplete(courseId: number, lessonId: number) {
        const response = await api.post<{
            lessonId: number;
            isCompleted: boolean;
            progressPercent: number;
            updatedAt?: string;
        }>(`/courses/${courseId}/lessons/${lessonId}/complete`);
        if (!response.success) {
            throw toApiError(response, 'Failed to mark lesson complete');
        }

        return response.data;
    },

    async updateLessonProgress(
        lessonId: number,
        lastWatchedSeconds: number,
        options?: { keepalive?: boolean },
    ) {
        const response = await api.patch<{
            lastWatchedSeconds: number;
            isCompleted: boolean;
        }>(`/lessons/${lessonId}/progress`, {
            lastWatchedSeconds,
        }, {
            keepalive: options?.keepalive,
        });
        if (!response.success) {
            throw toApiError(response, 'Failed to persist lesson progress');
        }

        return response.data;
    },
};
