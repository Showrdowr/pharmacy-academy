// Courses API Service
import type {
    Course,
    CourseCard,
    CourseFilters,
    CoursesListResponse,
    CourseProgress,
    EnrolledCourse
} from '../types';

import { api } from '@/lib/api';

/**
 * Courses API Service
 * จัดการ API calls ทั้งหมดที่เกี่ยวกับ Courses
 */
export const coursesService = {
    /**
     * ดึงรายการคอร์สทั้งหมด
     */
    async getCourses(params: CourseFilters & { page?: number; limit?: number }): Promise<CoursesListResponse> {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.set('search', params.search);
        if (params.category) queryParams.set('category', params.category);
        if (params.difficulty) queryParams.set('difficulty', params.difficulty);
        if (params.hasCPE !== undefined) queryParams.set('hasCPE', String(params.hasCPE));
        if (params.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params.page) queryParams.set('page', String(params.page));
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.priceRange) {
            queryParams.set('minPrice', String(params.priceRange.min));
            queryParams.set('maxPrice', String(params.priceRange.max));
        }

        const response = await api.get<CoursesListResponse>(`/public/courses?${queryParams}`);
        if (!response.success) throw new Error(response.message || 'Failed to fetch courses');
        return response.data;
    },

    /**
     * ดึงข้อมูลคอร์สตาม ID
     */
    async getCourseDetail(id: number): Promise<Course> {
        const response = await api.get<Course>(`/public/courses/${id}`);
        if (!response.success) throw new Error(response.message || 'ไม่พบคอร์สที่ต้องการ');
        return response.data;
    },

    /**
     * ดึงข้อมูลคอร์สตาม Slug
     */
    async getCourseBySlug(slug: string): Promise<Course> {
        const response = await api.get<Course>(`/courses/slug/${slug}`);
        if (!response.success) throw new Error(response.message || 'ไม่พบคอร์สที่ต้องการ');
        return response.data;
    },

    /**
     * ดึงคอร์สที่ลงทะเบียนแล้ว (ต้อง login)
     */
    async getEnrolledCourses(): Promise<EnrolledCourse[]> {
        const response = await api.get<EnrolledCourse[]>('/courses/enrolled');
        if (!response.success) throw new Error(response.message || 'Failed to fetch enrolled courses');
        return response.data;
    },

    /**
     * ลงทะเบียนคอร์ส
     */
    async enrollCourse(courseId: number): Promise<void> {
        const response = await api.post<void>(`/courses/${courseId}/enroll`);
        if (!response.success) throw new Error(response.message || 'Failed to enroll course');
    },

    /**
     * ดึงความคืบหน้าการเรียน
     */
    async getCourseProgress(courseId: number): Promise<CourseProgress> {
        const response = await api.get<CourseProgress>(`/courses/${courseId}/progress`);
        if (!response.success) throw new Error(response.message || 'Failed to fetch progress');
        return response.data;
    },

    /**
     * อัพเดทความคืบหน้า - Mark lesson as complete
     */
    async markLessonComplete(courseId: number, lessonId: number): Promise<void> {
        const response = await api.post<void>(`/courses/${courseId}/lessons/${lessonId}/complete`);
        if (!response.success) throw new Error(response.message || 'Failed to mark lesson as complete');
    },

    /**
     * ดึง Related Courses
     */
    async getRelatedCourses(courseId: number, limit = 4): Promise<CourseCard[]> {
        const response = await api.get<CourseCard[]>(`/courses/${courseId}/related?limit=${limit}`);
        if (!response.success) throw new Error(response.message || 'Failed to fetch related courses');
        return response.data;
    },

    /**
     * ดึง Featured Courses
     */
    async getFeaturedCourses(limit = 6): Promise<CourseCard[]> {
        const response = await api.get<CourseCard[]>(`/courses/featured?limit=${limit}`);
        if (!response.success) throw new Error(response.message || 'Failed to fetch featured courses');
        return response.data;
    },

    /**
     * ดึง Popular Courses
     */
    async getPopularCourses(limit = 8): Promise<CourseCard[]> {
        const response = await api.get<CourseCard[]>(`/courses/popular?limit=${limit}`);
        if (!response.success) throw new Error(response.message || 'Failed to fetch popular courses');
        return response.data;
    },
};

export default coursesService;
