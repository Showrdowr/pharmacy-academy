'use client';

// Courses Feature - Custom Hooks
import { useState, useEffect, useCallback, useMemo } from 'react';
import { coursesService } from './services';
import type {
    Course,
    CourseCard,
    CourseFilters,
    EnrolledCourse,
    CourseProgress,
    EnrolledCourseStatusFilter,
} from './types';

// ==========================================
// useCourses - จัดการรายการคอร์สทั้งหมด
// ==========================================
interface UseCoursesOptions {
    initialFilters?: CourseFilters;
    limit?: number;
}

interface UseCoursesReturn {
    courses: CourseCard[];
    isLoading: boolean;
    error: string | null;
    filters: CourseFilters;
    setFilters: (filters: CourseFilters) => void;
    totalCount: number;
    hasMore: boolean;
    loadMore: () => void;
    refresh: () => void;
}

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
    const { initialFilters = {}, limit = 12 } = options;

    const [courses, setCourses] = useState<CourseCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<CourseFilters>(initialFilters);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchCourses = useCallback(async (currentPage: number, append = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await coursesService.getCourses({ ...filters, page: currentPage, limit });

            if (append) {
                setCourses(prev => [...prev, ...response.courses]);
            } else {
                setCourses(response.courses);
            }

            setTotalCount(response.total);
            setHasMore(response.hasMore ?? response.courses.length === limit);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดคอร์ส');
        } finally {
            setIsLoading(false);
        }
    }, [filters, limit]);

    useEffect(() => {
        setPage(1);
        fetchCourses(1);
    }, [filters, fetchCourses]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCourses(nextPage, true);
        }
    }, [isLoading, hasMore, page, fetchCourses]);

    const refresh = useCallback(() => {
        setPage(1);
        fetchCourses(1);
    }, [fetchCourses]);

    return {
        courses,
        isLoading,
        error,
        filters,
        setFilters,
        totalCount,
        hasMore,
        loadMore,
        refresh,
    };
}

// ==========================================
// useCourseDetail - จัดการข้อมูลคอร์สเดียว
// ==========================================
interface UseCourseDetailReturn {
    course: Course | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useCourseDetail(courseId: number | string): UseCourseDetailReturn {
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCourseDetail = useCallback(async () => {
        if (!courseId) return;

        try {
            setIsLoading(true);
            setError(null);

            const data = await coursesService.getCourseDetail(Number(courseId));
            setCourse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'ไม่พบคอร์สที่ต้องการ');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) {
            fetchCourseDetail();
        }
    }, [courseId, fetchCourseDetail]);

    return {
        course,
        isLoading,
        error,
        refresh: fetchCourseDetail,
    };
}

// ==========================================
// useEnrolledCourses - คอร์สที่ลงทะเบียนแล้ว
// ==========================================
interface UseEnrolledCoursesReturn {
    enrolledCourses: EnrolledCourse[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useEnrolledCourses(enabled = true, status: EnrolledCourseStatusFilter = 'active'): UseEnrolledCoursesReturn {
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEnrolledCourses = useCallback(async () => {
        if (!enabled) {
            setEnrolledCourses([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const courses = await coursesService.getEnrolledCourses(status);
            setEnrolledCourses(courses);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setIsLoading(false);
        }
    }, [enabled, status]);

    useEffect(() => {
        fetchEnrolledCourses();
    }, [fetchEnrolledCourses]);

    return {
        enrolledCourses,
        isLoading,
        error,
        refresh: fetchEnrolledCourses,
    };
}

// ==========================================
// useCourseProgress - ติดตามความคืบหน้า
// ==========================================
interface UseCourseProgressReturn {
    progress: CourseProgress | null;
    isLoading: boolean;
    markLessonComplete: (lessonId: number) => Promise<void>;
    updateLastAccessed: (lessonId: number) => void;
}

export function useCourseProgress(courseId: number): UseCourseProgressReturn {
    const [progress, setProgress] = useState<CourseProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                const data = await coursesService.getCourseProgress(courseId);
                setProgress(data);
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchProgress();
        }
    }, [courseId]);

    const markLessonComplete = useCallback(async (lessonId: number) => {
        if (!progress) return;

        await coursesService.markLessonComplete(courseId, lessonId);

        setProgress(prev => {
            if (!prev) return prev;

            // Avoid duplicate lessons
            const completedLessons = prev.completedLessons.includes(lessonId)
                ? prev.completedLessons
                : [...prev.completedLessons, lessonId];

            return {
                ...prev,
                completedLessons,
                lastAccessedAt: new Date().toISOString(),
            };
        });
    }, [progress]);

    const updateLastAccessed = useCallback((lessonId: number) => {
        setProgress(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                lastAccessedLessonId: lessonId,
                lastAccessedAt: new Date().toISOString(),
            };
        });
    }, []);

    return {
        progress,
        isLoading,
        markLessonComplete,
        updateLastAccessed,
    };
}

// ==========================================
// useCourseSearch - ค้นหาและ Filter
// ==========================================
export function useCourseSearch(courses: CourseCard[], filters: CourseFilters) {
    return useMemo(() => {
        let filteredCourses = [...courses];

        // Search by title
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredCourses = filteredCourses.filter(course =>
                course.title.toLowerCase().includes(searchLower)
            );
        }

        // Filter by category
        if (filters.category) {
            filteredCourses = filteredCourses.filter(
                course => course.category === filters.category
            );
        }

        // Filter by CPE
        if (filters.hasCPE) {
            filteredCourses = filteredCourses.filter(
                course => course.cpeCredits && course.cpeCredits > 0
            );
        }

        // Filter by price range
        if (filters.priceRange) {
            filteredCourses = filteredCourses.filter(
                course =>
                    course.price >= filters.priceRange!.min &&
                    course.price <= filters.priceRange!.max
            );
        }

        // Sort
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price-low':
                    filteredCourses.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredCourses.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredCourses.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    // Would need createdAt field
                    break;
                case 'popular':
                default:
                    // Would need enrollment count
                    break;
            }
        }

        return filteredCourses;
    }, [courses, filters]);
}
