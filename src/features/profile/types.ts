// Profile Types for Pharmacy Academy LMS

/**
 * ข้อมูลโปรไฟล์เต็ม
 */
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: 'general' | 'pharmacist';
    bio?: string;
    // เภสัชกร specific
    pharmacistLicense?: string;
    pharmacistVerificationStatus?: 'pending' | 'verified' | 'rejected';
    graduatedFrom?: string;
    yearsOfExperience?: number;
    workplace?: string;
    specializations?: string[];
    // Stats
    totalCourses: number;
    completedCourses: number;
    totalCPECredits: number;
    // Dates
    createdAt: string;
    updatedAt: string;
}

/**
 * ข้อมูลสำหรับอัพเดทโปรไฟล์
 */
export interface UpdateProfileData {
    name?: string;
    phone?: string;
    bio?: string;
    workplace?: string;
    specializations?: string[];
}

/**
 * ข้อมูลสำหรับเปลี่ยนรหัสผ่าน
 */
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * CPE Summary
 */
export interface CPESummary {
    totalCredits: number;
    thisYearCredits: number;
    requiredCredits: number;
    expirationDate?: string;
}

/**
 * Learning Stats
 */
export interface LearningStats {
    enrolledCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLearningHours: number;
    currentStreak: number;
    longestStreak: number;
}

/**
 * Certificate
 */
export interface Certificate {
    id: string;
    courseId: number;
    courseTitle: string;
    completedAt: string;
    certificateUrl: string;
    cpeCredits?: number;
}

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
    emailNotifications: boolean;
    courseUpdates: boolean;
    promotions: boolean;
    reminders: boolean;
}
