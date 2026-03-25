import {
    canViewerSeeCourse,
    filterVisibleCoursesForViewer,
    getCourseViewerRole,
    isCourseRestrictedForViewer,
    normalizeCourseAudience,
} from './audience';

describe('course audience helpers', () => {
    it('normalizes unknown values to all', () => {
        expect(normalizeCourseAudience(undefined)).toBe('all');
        expect(normalizeCourseAudience('')).toBe('all');
        expect(normalizeCourseAudience('team')).toBe('all');
        expect(normalizeCourseAudience('pharmacist')).toBe('pharmacist');
    });

    it('resolves viewer roles from auth state', () => {
        expect(getCourseViewerRole(null, false)).toBe('guest');
        expect(getCourseViewerRole({ role: 'general' } as never, true)).toBe('general');
        expect(getCourseViewerRole({ role: 'pharmacist' } as never, true)).toBe('pharmacist');
    });

    it('hides pharmacist-only courses from general viewers only', () => {
        expect(canViewerSeeCourse('pharmacist', 'guest')).toBe(true);
        expect(canViewerSeeCourse('pharmacist', 'pharmacist')).toBe(true);
        expect(canViewerSeeCourse('pharmacist', 'general')).toBe(false);
        expect(canViewerSeeCourse('general', 'general')).toBe(true);
    });

    it('marks direct access as restricted only for authenticated general users', () => {
        expect(isCourseRestrictedForViewer('pharmacist', 'guest')).toBe(false);
        expect(isCourseRestrictedForViewer('pharmacist', 'pharmacist')).toBe(false);
        expect(isCourseRestrictedForViewer('pharmacist', 'general')).toBe(true);
    });

    it('filters collections according to viewer role', () => {
        const courses = [
            { id: 1, audience: 'all' },
            { id: 2, audience: 'general' },
            { id: 3, audience: 'pharmacist' },
        ];

        expect(filterVisibleCoursesForViewer(courses, 'guest').map((course) => course.id)).toEqual([1, 2, 3]);
        expect(filterVisibleCoursesForViewer(courses, 'pharmacist').map((course) => course.id)).toEqual([1, 2, 3]);
        expect(filterVisibleCoursesForViewer(courses, 'general').map((course) => course.id)).toEqual([1, 2]);
    });
});
