import { api, toApiError } from '@/lib/api';
import type {
    CourseProgressResponse,
    InteractiveAnswerResponse,
    LearningCourseData,
} from '../types';

export const learningApi = {
    async getCourseLearning(courseId: number): Promise<LearningCourseData> {
        const response = await api.get<LearningCourseData>(`/courses/${courseId}/learning`);
        if (!response.success) {
            throw toApiError(response, 'โหลดข้อมูลการเรียนไม่สำเร็จ');
        }

        return response.data;
    },

    async getCourseProgress(courseId: number): Promise<CourseProgressResponse> {
        const response = await api.get<CourseProgressResponse>(`/courses/${courseId}/progress`);
        if (!response.success) {
            throw toApiError(response, 'โหลดความคืบหน้าไม่สำเร็จ');
        }

        return response.data;
    },

    async submitVideoQuestionAnswer(questionId: number, answerGiven: string): Promise<InteractiveAnswerResponse> {
        const response = await api.post<InteractiveAnswerResponse>(`/video-questions/${questionId}/answer`, {
            answerGiven,
        });
        if (!response.success) {
            throw toApiError(response, 'ส่งคำตอบไม่สำเร็จ');
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
            throw toApiError(response, 'บันทึกการจบบทเรียนไม่สำเร็จ');
        }

        return response.data;
    },

    async updateLessonProgress(lessonId: number, lastWatchedSeconds: number) {
        const response = await api.patch<{
            lastWatchedSeconds: number;
            isCompleted: boolean;
        }>(`/lessons/${lessonId}/progress`, {
            lastWatchedSeconds,
        });
        if (!response.success) {
            throw toApiError(response, 'บันทึกความคืบหน้าวิดีโอไม่สำเร็จ');
        }

        return response.data;
    },
};
