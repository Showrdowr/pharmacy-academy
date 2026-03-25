import { isPharmacistUser } from '@/features/auth';
import type { User } from '@/features/auth';

export type CourseAudience = 'all' | 'general' | 'pharmacist';
export type CourseViewerRole = 'guest' | 'general' | 'pharmacist';

type AudienceLike = {
    audience?: string | null;
};

export function normalizeCourseAudience(value?: string | null): CourseAudience {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

    if (normalized === 'general' || normalized === 'pharmacist') {
        return normalized;
    }

    return 'all';
}

export function getCourseViewerRole(user?: User | null, isAuthenticated?: boolean): CourseViewerRole {
    if (!isAuthenticated || !user) {
        return 'guest';
    }

    return isPharmacistUser(user) ? 'pharmacist' : 'general';
}

export function canViewerSeeCourse(audience: string | null | undefined, viewerRole: CourseViewerRole): boolean {
    const normalizedAudience = normalizeCourseAudience(audience);

    if (viewerRole === 'guest' || viewerRole === 'pharmacist') {
        return true;
    }

    return normalizedAudience !== 'pharmacist';
}

export function isCourseRestrictedForViewer(
    audience: string | null | undefined,
    viewerRole: CourseViewerRole,
): boolean {
    return viewerRole === 'general' && normalizeCourseAudience(audience) === 'pharmacist';
}

export function filterVisibleCoursesForViewer<T extends AudienceLike>(courses: T[], viewerRole: CourseViewerRole): T[] {
    return courses.filter((course) => canViewerSeeCourse(course.audience, viewerRole));
}

