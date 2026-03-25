// Course Types for Pharmacy Academy LMS

export type CourseCategory =
    | 'pharmaceutical-care'
    | 'drug-interaction'
    | 'clinical-pharmacy'
    | 'community-pharmacy'
    | 'hospital-pharmacy'
    | 'general';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseVideoStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type CourseAudience = 'all' | 'general' | 'pharmacist';
export type EnrollmentStatus = 'ACTIVE' | 'CANCELLED' | 'REFUND_PENDING';
export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type EnrolledCourseStatusFilter = 'active' | 'cancelled' | 'all';

export interface Instructor {
    id: number;
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
}

export interface CoursePreviewVideo {
    id: number;
    provider: string;
    resourceId: string;
    duration: number;
    name?: string | null;
    status: CourseVideoStatus;
    playbackUrl: string | null;
}

export interface RelatedCourseSummary {
    id: number;
    title: string;
    titleEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    thumbnail?: string | null;
    authorName?: string | null;
    price?: number | null;
    cpeCredits?: number | null;
    audience?: CourseAudience | string | null;
    enrolledCount?: number | null;
    enrollmentsCount?: number | null;
    totalDurationSeconds?: number | null;
    durationMinutes?: number | null;
    category?: CourseCategory | string | { name?: string | null; nameEn?: string | null } | null;
    rating?: number | null;
    reviewsCount?: number | null;
    lessonsCount?: number | null;
}

export interface Lesson {
    id: number;
    title: string;
    duration: number;
    type: 'video' | 'document' | 'quiz';
    isCompleted?: boolean;
    videoUrl?: string;
}

export interface CourseSection {
    id: number;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: number;
    title: string;
    titleEn?: string | null;
    slug: string;
    description: string;
    descriptionEn?: string | null;
    details?: string;
    detailsEn?: string | null;
    shortDescription?: string;
    thumbnail: string;
    price: number;
    originalPrice?: number;
    instructor: Instructor;
    category: CourseCategory;
    categoryEn?: string | null;
    difficulty: DifficultyLevel;
    duration: number;
    lessonsCount: number;
    studentsCount: number;
    rating: number;
    reviewsCount: number;
    cpeCredits?: number;
    previewVideo?: CoursePreviewVideo | null;
    relatedCourses?: RelatedCourseSummary[];
    relatedCourseIds?: number[];
    sections?: CourseSection[];
    requirements?: string[];
    whatYouWillLearn?: string[];
    tags?: string[];
    audience?: CourseAudience;
    status: CourseStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CourseCard {
    id: number;
    title: string;
    titleEn?: string | null;
    thumbnail: string;
    price: number;
    originalPrice?: number;
    instructor: {
        name: string;
        avatar?: string;
    };
    category: CourseCategory;
    categoryEn?: string | null;
    rating: number;
    reviewsCount: number;
    lessonsCount: number;
    duration: number;
    cpeCredits?: number;
    audience?: CourseAudience;
}

export interface CourseProgress {
    courseId: number;
    completedLessons: number[];
    lastAccessedLessonId?: number;
    watchPercent: number;
    completionPercent: number;
    progressPercent: number;
    startedAt: string;
    lastAccessedAt: string;
}

export interface EnrolledCourse {
    id: number;
    courseId: number;
    title: string;
    titleEn?: string | null;
    thumbnail?: string | null;
    authorName?: string | null;
    instructor?: string | null;
    price?: number;
    cpeCredits?: number;
    cpe?: number;
    watchPercent: number;
    completionPercent: number;
    progressPercent: number;
    progress?: number;
    status: 'in_progress' | 'completed';
    enrollmentStatus?: EnrollmentStatus;
    courseStatus?: 'PUBLISHED' | 'ARCHIVED';
    enrolledAt: string;
    lastAccessedAt?: string | null;
    lastAccessedLessonId?: number | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    cancelReason?: string | null;
    sourceOrderItemId?: number | null;
    certificateUrl?: string | null;
    certificateCode?: string | null;
    courseTitle?: string;
    hasCertificate?: boolean;
    audience?: CourseAudience;
    refundRequest?: {
        id: number;
        status: RefundRequestStatus;
        reason?: string | null;
        adminNote?: string | null;
        requestedAt?: string | null;
        resolvedAt?: string | null;
        resolvedByAdminId?: string | null;
        orderItemId?: number | null;
    } | null;
    refundRequestStatus?: RefundRequestStatus | null;
}

export interface CourseFilters {
    search?: string;
    category?: CourseCategory;
    difficulty?: DifficultyLevel;
    priceRange?: {
        min: number;
        max: number;
    };
    hasCPE?: boolean;
    sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
}

export interface CoursesListResponse {
    courses: CourseCard[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
