"use client"

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth';
import { filterVisibleCoursesForViewer, getCourseViewerRole } from '@/features/courses/audience';
import { formatCourseDuration, resolveCourseDurationMinutes, resolveCourseStudentsCount } from '@/features/courses/course-card-display';
import { getLocalizedContent, useAppLocale } from '@/features/i18n';
import type { Course as GridCourse } from '../data/mockData';
import CourseCard from './CourseCard';

type RelatedCourseItem = {
    id: number;
    title?: string | null;
    titleEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    thumbnail?: string | null;
    authorName?: string | null;
    price?: number | null;
    cpeCredits?: number | null;
    enrolledCount?: number | null;
    enrollmentsCount?: number | null;
    durationMinutes?: number | null;
    totalDurationSeconds?: number | null;
    audience?: string | null;
    category?: { name?: string | null; nameEn?: string | null } | string | null;
};

interface RelatedCoursesProps {
    courses?: RelatedCourseItem[];
}

function getCategoryName(course: RelatedCourseItem, locale: 'th' | 'en') {
    if (typeof course.category === 'string') {
        return course.category;
    }

    return locale === 'en'
        ? course.category?.nameEn || course.category?.name || ''
        : course.category?.name || course.category?.nameEn || '';
}

const RelatedCourses: React.FC<RelatedCoursesProps> = ({ courses = [] }) => {
    const t = useTranslations('courses.detail');
    const { locale } = useAppLocale();
    const { user, isAuthenticated } = useAuth();
    const viewerRole = getCourseViewerRole(user, isAuthenticated);

    const mappedCourses = useMemo<GridCourse[]>(
        () =>
            filterVisibleCoursesForViewer(courses, viewerRole).map((course) => ({
                id: Number(course.id),
                title: String(course.title || t('fallbackCourseTitle')),
                titleEn: String(course.titleEn || course.title || t('fallbackCourseTitle')),
                category: getCategoryName(course, 'th') || t('otherCategory'),
                categoryEn: getCategoryName(course, 'en') || getCategoryName(course, 'th') || t('otherCategory'),
                instructor: String(course.authorName || t('instructorFallback')),
                cpe: Number(course.cpeCredits || 0),
                price: Number(course.price || 0),
                level: t('skillLevelAll'),
                rating: 5,
                students: resolveCourseStudentsCount(course),
                duration: formatCourseDuration(
                    resolveCourseDurationMinutes(course),
                    t,
                    t('fallbackDuration'),
                ),
                image: String(course.thumbnail || '/assets/img/courses/01.jpg'),
                description:
                    getLocalizedContent(locale, course.description, course.descriptionEn)
                    || getLocalizedContent(locale, course.title, course.titleEn)
                    || t('qualityCourse'),
                audience: typeof course.audience === 'string' ? course.audience as GridCourse['audience'] : 'all',
            })),
        [courses, locale, t, viewerRole]
    );

    if (mappedCourses.length === 0) {
        return null;
    }

    return (
        <section className="popular-courses-section fix section-padding pt-0">
            <div className="container">
                <div className="section-title text-center">
                    <h2 className="wow fadeInUp">{t('relatedCoursesTitle')}</h2>
                </div>
                <div className="row">
                    {mappedCourses.slice(0, 4).map((course) => (
                        <div key={course.id} className="col-xl-3 col-lg-4 col-md-6">
                            <CourseCard course={course} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedCourses;
