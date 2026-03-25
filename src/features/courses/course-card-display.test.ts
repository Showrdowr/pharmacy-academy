import { describe, expect, it } from 'vitest';
import {
    formatCourseDuration,
    resolveCourseDurationMinutes,
    resolveCourseStudentsCount,
} from './course-card-display';

describe('course-card-display', () => {
    it('resolves enrolled learners from public course summary fields', () => {
        expect(resolveCourseStudentsCount({ enrolledCount: 12 })).toBe(12);
        expect(resolveCourseStudentsCount({ enrollmentsCount: 8 })).toBe(8);
        expect(resolveCourseStudentsCount({ students: 5 })).toBe(5);
    });

    it('resolves duration from explicit minutes and total duration seconds', () => {
        expect(resolveCourseDurationMinutes({ durationMinutes: 95 })).toBe(95);
        expect(resolveCourseDurationMinutes({ totalDurationSeconds: 5400 })).toBe(90);
    });

    it('formats duration labels for the course card', () => {
        const t = (key: 'durationHourMinute' | 'durationHourOnly' | 'durationMinuteOnly', values: { hours?: number; minutes?: number }) => {
            switch (key) {
                case 'durationHourMinute':
                    return `${values.hours} hr ${values.minutes} min`;
                case 'durationHourOnly':
                    return `${values.hours} hr`;
                default:
                    return `${values.minutes} min`;
            }
        };

        expect(formatCourseDuration(125, t, '0 hr')).toBe('2 hr 5 min');
        expect(formatCourseDuration(60, t, '0 hr')).toBe('1 hr');
        expect(formatCourseDuration(0, t, '0 hr')).toBe('0 hr');
    });
});
