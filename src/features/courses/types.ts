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
    slug: string;
    description: string;
    shortDescription?: string;
    thumbnail: string;
    price: number;
    originalPrice?: number;
    instructor: Instructor;
    category: CourseCategory;
    difficulty: DifficultyLevel;
    duration: number; // total minutes
    lessonsCount: number;
    studentsCount: number;
    rating: number;
    reviewsCount: number;
    cpeCredits?: number; // หน่วยกิต CPE สำหรับเภสัชกร
    sections?: CourseSection[];
    requirements?: string[];
    whatYouWillLearn?: string[];
    tags?: string[];
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
    thumbnail: string;
    price: number;
    originalPrice?: number;
    instructor: {
        name: string;
        avatar?: string;
    };
    category: CourseCategory;
    rating: number;
    reviewsCount: number;
    lessonsCount: number;
    duration: number;
    cpeCredits?: number;
}

/**
 * ความคืบหน้าการเรียน
 */
export interface CourseProgress {
    courseId: number;
    completedLessons: number[];
    lastAccessedLessonId?: number;
    progressPercent: number;
    startedAt: string;
    lastAccessedAt: string;
}

/**
 * คอร์สที่กำลังเรียน (My Courses)
 */
export interface EnrolledCourse extends CourseCard {
    progress: CourseProgress;
    enrolledAt: string;
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
