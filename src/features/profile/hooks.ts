// Profile Hooks - Business logic for user profile
'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
    UserProfile,
    UpdateProfileData,
    ChangePasswordData,
    CPESummary,
    LearningStats,
    Certificate,
    NotificationPreferences,
} from './types';
import { normalizeAuthUser } from '@/features/auth/role';
import { authService } from '@/features/auth/services/authApi';
import { coursesService } from '@/features/courses/services/coursesApi';

/**
 * useProfile hook
 * ใช้สำหรับจัดการโปรไฟล์ผู้ใช้
 */
export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const rawUser = await authService.getCurrentUser();
            const user = normalizeAuthUser(rawUser);
            if (user) {
                setProfile({
                    id: user.id,
                    name: user.fullName || '',
                    email: user.email,
                    role: user.role,
                    pharmacistLicense: user.professionalLicenseNumber,
                    pharmacistVerificationStatus: user.pharmacistVerificationStatus,
                    totalCourses: 0,
                    completedCourses: 0,
                    totalCPECredits: 0,
                    createdAt: '',
                    updatedAt: '',
                });
            } else {
                setProfile(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
        try {
            const response = await authService.updateProfile({ fullName: data.name });
            if (response.success && response.user) {
                setProfile((prev) => (prev ? { ...prev, ...data } : null));
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    const updateAvatar = useCallback(async (file: File): Promise<boolean> => {
        try {
            // TODO: Replace with actual API call (upload image)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock: Create local URL
            const avatarUrl = URL.createObjectURL(file);
            setProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
            return true;
        } catch {
            return false;
        }
    }, []);

    return {
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        updateAvatar,
    };
}

/**
 * useChangePassword hook
 * ใช้สำหรับเปลี่ยนรหัสผ่าน
 */
export function useChangePassword() {
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const changePassword = useCallback(async (data: ChangePasswordData): Promise<boolean> => {
        setIsChanging(true);
        setError(null);
        setSuccess(false);

        // Validate
        if (data.newPassword !== data.confirmPassword) {
            setError('รหัสผ่านใหม่ไม่ตรงกัน');
            setIsChanging(false);
            return false;
        }

        if (data.newPassword.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            setIsChanging(false);
            return false;
        }

        try {
            const response = await authService.changePassword(data.currentPassword, data.newPassword);
            if (response.success) {
                setSuccess(true);
                return true;
            } else {
                setError(response.error || 'เปลี่ยนรหัสผ่านล้มเหลว');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
            return false;
        } finally {
            setIsChanging(false);
        }
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        isChanging,
        error,
        success,
        changePassword,
        reset,
    };
}

/**
 * useCPESummary hook
 * ใช้สำหรับแสดงสรุป CPE credits (เภสัชกร)
 */
export function useCPESummary() {
    const [summary, setSummary] = useState<CPESummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            try {
                const enrolled = await coursesService.getEnrolledCourses();
                const totalCredits = enrolled
                    .filter((c: any) => c.status === 'completed')
                    .reduce((sum: number, c: any) => sum + (c.cpeCredits || 0), 0);
                const thisYear = new Date().getFullYear();
                const thisYearCredits = enrolled
                    .filter((c: any) => c.status === 'completed' && new Date(c.completedAt).getFullYear() === thisYear)
                    .reduce((sum: number, c: any) => sum + (c.cpeCredits || 0), 0);

                setSummary({
                    totalCredits,
                    thisYearCredits,
                    requiredCredits: 100,
                });
            } catch {
                setSummary({ totalCredits: 0, thisYearCredits: 0, requiredCredits: 100 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    return { summary, isLoading };
}

/**
 * useLearningStats hook
 * ใช้สำหรับแสดงสถิติการเรียน
 */
export function useLearningStats() {
    const [stats, setStats] = useState<LearningStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const enrolled = await coursesService.getEnrolledCourses();
                const completed = enrolled.filter((c: any) => c.status === 'completed').length;
                const inProgress = enrolled.filter((c: any) => c.status !== 'completed').length;

                setStats({
                    enrolledCourses: enrolled.length,
                    completedCourses: completed,
                    inProgressCourses: inProgress,
                    totalLearningHours: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                });
            } catch {
                setStats({ enrolledCourses: 0, completedCourses: 0, inProgressCourses: 0, totalLearningHours: 0, currentStreak: 0, longestStreak: 0 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, isLoading };
}

/**
 * useCertificates hook
 * ใช้สำหรับดูใบ Certificate
 */
export function useCertificates() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            setIsLoading(true);
            try {
                const enrolled = await coursesService.getEnrolledCourses();
                const certs: Certificate[] = enrolled
                    .filter((c: any) => c.status === 'completed' && c.certificateUrl)
                    .map((c: any) => ({
                        id: String(c.id),
                        courseId: c.courseId,
                        courseTitle: c.courseTitle || '',
                        completedAt: c.completedAt || '',
                        certificateUrl: c.certificateUrl || '',
                        cpeCredits: c.cpeCredits,
                    }));
                setCertificates(certs);
            } catch {
                setCertificates([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const downloadCertificate = useCallback(async (certificateId: string) => {
        try {
            // TODO: Replace with actual API call
            const certificate = certificates.find((c) => c.id === certificateId);
            if (certificate?.certificateUrl) {
                window.open(certificate.certificateUrl, '_blank');
            }
        } catch (err) {
            console.error('Failed to download certificate:', err);
        }
    }, [certificates]);

    return {
        certificates,
        isLoading,
        downloadCertificate,
    };
}

/**
 * useNotificationPreferences hook
 * ใช้สำหรับจัดการ notification settings
 */
export function useNotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailNotifications: true,
        courseUpdates: true,
        promotions: false,
        reminders: true,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            setIsLoading(true);
            try {
                // TODO: Replace with actual API call
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Keep default values
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>): Promise<boolean> => {
        setIsSaving(true);
        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            setPreferences((prev) => ({ ...prev, ...updates }));
            return true;
        } catch {
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        preferences,
        isLoading,
        isSaving,
        updatePreferences,
    };
}
