// Courses API Service
import type {
    Course,
    CourseCard,
    CourseFilters,
    CoursesListResponse,
    CourseProgress,
    EnrolledCourse,
    EnrolledCourseStatusFilter,
} from '../types';

import { api, toApiError } from '@/lib/api';
import { normalizeCourseAudience } from '../audience';

function normalizeCourseAudienceValue<T extends { audience?: unknown }>(course: T): T & { audience: 'all' | 'general' | 'pharmacist' } {
    return {
        ...course,
        audience: normalizeCourseAudience(typeof course.audience === 'string' ? course.audience : null),
    };
}

type RawCoursesListPayload = CoursesListResponse | CourseCard[] | null | undefined;

function extractCourseListItems(payload: RawCoursesListPayload): CourseCard[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.courses)) {
        return payload.courses;
    }

    return [];
}

function normalizeCoursesListResponse(payload: RawCoursesListPayload): CoursesListResponse {
    const items = extractCourseListItems(payload);
    const normalizedCourses = items.map((course) => normalizeCourseAudienceValue(course));

    if (Array.isArray(payload)) {
        return {
            courses: normalizedCourses,
            total: normalizedCourses.length,
            page: 1,
            limit: normalizedCourses.length,
            hasMore: false,
        };
    }

    const total = typeof payload?.total === 'number' ? payload.total : normalizedCourses.length;
    const page = typeof payload?.page === 'number' ? payload.page : 1;
    const limit = typeof payload?.limit === 'number' ? payload.limit : normalizedCourses.length;
    const hasMore = typeof payload?.hasMore === 'boolean'
        ? payload.hasMore
        : page * Math.max(limit, 1) < total;

    return {
        courses: normalizedCourses,
        total,
        page,
        limit,
        hasMore,
    };
}

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
        if (params.category) queryParams.set('categoryId', params.category);
        if (params.difficulty) queryParams.set('difficulty', params.difficulty);
        if (params.hasCPE !== undefined) queryParams.set('hasCPE', String(params.hasCPE));
        if (params.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params.page) queryParams.set('page', String(params.page));
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.priceRange) {
            queryParams.set('minPrice', String(params.priceRange.min));
            queryParams.set('maxPrice', String(params.priceRange.max));
        }

        const response = await api.get<CoursesListResponse | CourseCard[]>(`/public/courses?${queryParams}`);
        if (!response.success) throw toApiError(response, 'Failed to fetch courses');
        return normalizeCoursesListResponse(response.data);
    },

    /**
     * ดึงข้อมูลคอร์สตาม ID
     */
    async getCourseDetail(id: number): Promise<Course> {
        const response = await api.get<Course>(`/public/courses/${id}`);
        if (!response.success) throw toApiError(response, 'ไม่พบคอร์สที่ต้องการ');
        return {
            ...normalizeCourseAudienceValue(response.data),
            relatedCourses: Array.isArray((response.data as Course & { relatedCourses?: CourseCard[] }).relatedCourses)
                ? (response.data as Course & { relatedCourses?: CourseCard[] }).relatedCourses?.map((course) => normalizeCourseAudienceValue(course))
                : [],
        };
    },

    /**
     * ดึงข้อมูลคอร์สตาม Slug
     */
    async getCourseBySlug(slug: string): Promise<Course> {
        const response = await api.get<Course>(`/courses/slug/${slug}`);
        if (!response.success) throw toApiError(response, 'ไม่พบคอร์สที่ต้องการ');
        return {
            ...normalizeCourseAudienceValue(response.data),
            relatedCourses: Array.isArray((response.data as Course & { relatedCourses?: CourseCard[] }).relatedCourses)
                ? (response.data as Course & { relatedCourses?: CourseCard[] }).relatedCourses?.map((course) => normalizeCourseAudienceValue(course))
                : [],
        };
    },

    /**
     * ดึงคอร์สที่ลงทะเบียนแล้ว (ต้อง login)
     */
    async getEnrolledCourses(status: EnrolledCourseStatusFilter = 'active'): Promise<EnrolledCourse[]> {
        const response = await api.get<EnrolledCourse[]>('/courses/enrolled', { status });
        if (!response.success) throw toApiError(response, 'Failed to fetch enrolled courses');
        return Array.isArray(response.data)
            ? response.data.map((course) => normalizeCourseAudienceValue(course))
            : [];
    },

    async cancelCourse(courseId: number, reason?: string): Promise<{
        enrollmentStatus: 'CANCELLED' | 'REFUND_PENDING';
        cancelledAt?: string | null;
        refundRequest?: EnrolledCourse['refundRequest'];
    }> {
        const response = await api.post<{
            enrollmentStatus: 'CANCELLED' | 'REFUND_PENDING';
            cancelledAt?: string | null;
            refundRequest?: EnrolledCourse['refundRequest'];
        }>(`/courses/${courseId}/cancel`, reason ? { reason } : {});
        if (!response.success) throw toApiError(response, 'Failed to cancel course');
        return response.data;
    },

    /**
     * ลงทะเบียนคอร์ส
     */
    async enrollCourse(courseId: number): Promise<void> {
        const response = await api.post<void>(`/courses/${courseId}/enroll`);
        if (!response.success) throw toApiError(response, 'Failed to enroll course');
    },

    /**
     * ดึงความคืบหน้าการเรียน
     */
    async getCourseProgress(courseId: number): Promise<CourseProgress> {
        const response = await api.get<CourseProgress>(`/courses/${courseId}/progress`);
        if (!response.success) throw toApiError(response, 'Failed to fetch progress');
        return response.data;
    },

    /**
     * อัพเดทความคืบหน้า - Mark lesson as complete
     */
    async markLessonComplete(courseId: number, lessonId: number): Promise<void> {
        const response = await api.post<void>(`/courses/${courseId}/lessons/${lessonId}/complete`);
        if (!response.success) throw toApiError(response, 'Failed to mark lesson as complete');
    },

    /**
     * ดึง Related Courses
     */
    async getRelatedCourses(courseId: number, limit = 4): Promise<CourseCard[]> {
        const response = await api.get<CourseCard[]>(`/courses/${courseId}/related?limit=${limit}`);
        if (!response.success) throw toApiError(response, 'Failed to fetch related courses');
        return Array.isArray(response.data)
            ? response.data.map((course) => normalizeCourseAudienceValue(course))
            : [];
    },

    /**
     * ดึง Featured Courses
     */
    async getFeaturedCourses(limit = 6): Promise<CourseCard[]> {
        const response = await api.get<CourseCard[]>(`/courses/featured?limit=${limit}`);
        if (!response.success) throw toApiError(response, 'Failed to fetch featured courses');
        return Array.isArray(response.data)
            ? response.data.map((course) => normalizeCourseAudienceValue(course))
            : [];
    },

    /**
     * ดึง Popular Courses
     */
    async getPopularCourses(limit = 8): Promise<CourseCard[]> {
        const response = await api.get<CourseCard[]>(`/courses/popular?limit=${limit}`);
        if (!response.success) throw toApiError(response, 'Failed to fetch popular courses');
        return Array.isArray(response.data)
            ? response.data.map((course) => normalizeCourseAudienceValue(course))
            : [];
    },
};

export default coursesService;
