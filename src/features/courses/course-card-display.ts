type DurationTranslator = (
    key: 'durationHourMinute' | 'durationHourOnly' | 'durationMinuteOnly',
    values: { hours?: number; minutes?: number },
) => string;

function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveCourseStudentsCount(course: {
    students?: unknown;
    studentsCount?: unknown;
    enrolledCount?: unknown;
    enrollmentsCount?: unknown;
    enrollments?: unknown;
}) {
    return toNumber(
        course.students
        ?? course.studentsCount
        ?? course.enrolledCount
        ?? course.enrollmentsCount
        ?? course.enrollments
        ?? 0
    );
}

export function resolveCourseDurationMinutes(course: {
    durationMinutes?: unknown;
    totalDurationMinutes?: unknown;
    totalDurationSeconds?: unknown;
    durationSeconds?: unknown;
    duration?: unknown;
}) {
    const explicitMinutes = toNumber(course.durationMinutes ?? course.totalDurationMinutes);
    if (explicitMinutes > 0) {
        return Math.round(explicitMinutes);
    }

    const seconds = toNumber(course.totalDurationSeconds ?? course.durationSeconds);
    if (seconds > 0) {
        return Math.round(seconds / 60);
    }

    return Math.round(toNumber(course.duration));
}

export function formatCourseDuration(
    minutesValue: unknown,
    t: DurationTranslator,
    fallbackLabel: string,
) {
    const totalMinutes = Math.round(toNumber(minutesValue));
    if (totalMinutes <= 0) {
        return fallbackLabel;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return t('durationHourMinute', { hours, minutes });
    }

    if (hours > 0) {
        return t('durationHourOnly', { hours });
    }

    return t('durationMinuteOnly', { minutes });
}
