// Course Types for Pharmacy Academy LMS

/**
 * หมวดหมู่คอร์สเรียน
 */
export type CourseCategory =
    | 'pharmaceutical-care'
    | 'drug-interaction'
    | 'clinical-pharmacy'
    | 'community-pharmacy'
    | 'hospital-pharmacy'
    | 'general';

/**
 * ระดับความยาก
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * สถานะของคอร์ส
 */
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseVideoStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type CourseAudience = 'all' | 'general' | 'pharmacist';
export type EnrollmentStatus = 'ACTIVE' | 'CANCELLED' | 'REFUND_PENDING';
export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type EnrolledCourseStatusFilter = 'active' | 'cancelled' | 'all';

/**
 * ข้อมูลผู้สอน
 */
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

/**
 * บทเรียนในคอร์ส
 */
export interface Lesson {
    id: number;
    title: string;
    duration: number; // minutes
    type: 'video' | 'document' | 'quiz';
    isCompleted?: boolean;
    videoUrl?: string;
}

/**
 * หมวดหมู่บทเรียน (Section)
 */
export interface CourseSection {
    id: number;
    title: string;
    lessons: Lesson[];
}

/**
 * ข้อมูลคอร์สเรียนหลัก
 */
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
    duration: number; // total minutes
    lessonsCount: number;
    studentsCount: number;
    rating: number;
    reviewsCount: number;
    cpeCredits?: number; // หน่วยกิต CPE สำหรับเภสัชกร
    previewVideo?: CoursePreviewVideo | null;
    sections?: CourseSection[];
    requirements?: string[];
    whatYouWillLearn?: string[];
    tags?: string[];
    audience?: CourseAudience;
    relatedCourses?: CourseCard[];
    status: CourseStatus;
    createdAt: string;
    updatedAt: string;
}

/**
 * คอร์สในรูปแบบ Card (ข้อมูลย่อ)
 */
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

/**
 * ความคืบหน้าการเรียน
 */
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

/**
 * คอร์สที่กำลังเรียน (My Courses)
 */
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

/**
 * Filter สำหรับค้นหาคอร์ส
 */
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

/**
 * Response จาก API
 */
export interface CoursesListResponse {
    courses: CourseCard[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
