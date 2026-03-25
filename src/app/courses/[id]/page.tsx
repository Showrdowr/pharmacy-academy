import React from 'react';
import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import BreadcrumbCoursesDetails from '@/components/common/breadcrumb/BreadcrumbCoursesDetails';
import { CoursesDetailsArea, RelatedCourses } from '@/features/courses';
import { coursesService } from '@/features/courses/services/coursesApi';
import { formatLocaleDate, getLocalizedContent } from '@/features/i18n';
import type { AppLocale } from '@/i18n/config';

function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatDurationFromMinutes(
    minutesValue: unknown,
    t: Awaited<ReturnType<typeof getTranslations<'courses.detail'>>>,
): string {
    const totalMinutes = Math.round(toNumber(minutesValue));
    if (totalMinutes <= 0) return '-';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return t('durationHourMinute', { hours, minutes });
    if (hours > 0) return t('durationHourOnly', { hours });
    return t('durationMinuteOnly', { minutes });
}

function formatDisplayDate(value: unknown, locale: string): string {
    return formatLocaleDate(value instanceof Date || typeof value === 'string' ? value : null, locale === 'en' ? 'en' : 'th', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const resolvedParams = await params;
    const locale = await getLocale();
    const appLocale: AppLocale = locale === 'en' ? 'en' : 'th';
    const t = await getTranslations('courses.detail');

    try {
        const apiCourse = await coursesService.getCourseDetail(Number(resolvedParams.id)) as any;
        const courseTitle = `${getLocalizedContent(appLocale, apiCourse.title, apiCourse.titleEn) || t('fallbackCourseTitle')} - Pharmacy Academy`;
        const courseDesc =
            getLocalizedContent(appLocale, apiCourse.description, (apiCourse as { descriptionEn?: string | null }).descriptionEn) ||
            getLocalizedContent(appLocale, apiCourse.details, (apiCourse as { detailsEn?: string | null }).detailsEn) ||
            t('metaFallbackDescription');
        const rawCourseImage = apiCourse.thumbnail || '/assets/img/courses/01.jpg';
        const courseImage = /^(data:|blob:)/i.test(rawCourseImage)
            ? '/assets/img/courses/01.jpg'
            : rawCourseImage;

        return {
            title: courseTitle,
            description: courseDesc,
            openGraph: {
                title: courseTitle,
                description: courseDesc,
                images: [courseImage],
            },
        };
    } catch (error) {
        return {
            title: t('metaFallbackTitle'),
            description: t('metaFallbackDescription'),
        };
    }
}

export default async function CourseDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const locale = await getLocale();
    const appLocale: AppLocale = locale === 'en' ? 'en' : 'th';
    const t = await getTranslations('courses.detail');
    const courseId = Number(resolvedParams.id);

    if (isNaN(courseId)) {
        notFound();
    }

    let initialCourseData = null;

    try {
        const apiCourse = await coursesService.getCourseDetail(courseId) as any;
        if (apiCourse) {
            const course = apiCourse as any;
            const categoryValue = course.category;
            const categoryName =
                typeof categoryValue === 'object' && typeof categoryValue?.name === 'string'
                    ? categoryValue.name
                    : typeof categoryValue === 'string'
                        ? categoryValue
                        : '';
            const categoryNameEn =
                typeof categoryValue === 'object' && typeof categoryValue?.nameEn === 'string'
                    ? categoryValue.nameEn
                    : '';

            const lessons = Array.isArray(course.lessons) ? course.lessons : [];
            const lessonsCount = toNumber(course.lessonsCount) || lessons.length;
            const lessonVideoDurationSeconds = lessons.reduce(
                (sum: number, lesson: any) => sum + toNumber(lesson?.video?.duration),
                0,
            );
            const durationMinutes = toNumber(course.duration) || Math.round(lessonVideoDurationSeconds / 60);
            const normalizedSkillLevel = String(course.skillLevel || course.level || course.difficulty || '').toLowerCase();
            const studentsCount =
                toNumber(course.studentsCount) ||
                toNumber(course.enrollmentsCount) ||
                toNumber(course.enrollments) ||
                toNumber(course.reviewsCount);
            const previewVideo = course.previewVideo
                ? {
                    id: Number(course.previewVideo.id),
                    provider: String(course.previewVideo.provider || 'VIMEO'),
                    resourceId: String(course.previewVideo.resourceId || ''),
                    duration: toNumber(course.previewVideo.duration),
                    name: typeof course.previewVideo.name === 'string' ? course.previewVideo.name : null,
                    status: course.previewVideo.status === 'READY' || course.previewVideo.status === 'FAILED'
                        ? course.previewVideo.status
                        : 'PROCESSING',
                    playbackUrl: typeof course.previewVideo.playbackUrl === 'string' ? course.previewVideo.playbackUrl : null,
                }
                : null;
            const fullDetails =
                (typeof course.details === 'string' && course.details.trim()) ||
                (typeof apiCourse.details === 'string' && apiCourse.details.trim()) ||
                '';
            const fullDetailsEn =
                (typeof course.detailsEn === 'string' && course.detailsEn.trim()) ||
                (typeof apiCourse.detailsEn === 'string' && apiCourse.detailsEn.trim()) ||
                '';

            initialCourseData = {
                id: apiCourse.id,
                title: apiCourse.title,
                titleEn: apiCourse.titleEn || null,
                category: categoryName || t('otherCategory'),
                categoryEn: categoryNameEn || categoryName || t('otherCategory'),
                instructor: apiCourse.instructor?.name || course.authorName || t('instructorFallback'),
                cpe: apiCourse.cpeCredits || 0,
                price: toNumber(apiCourse.price),
                audience: apiCourse.audience || 'all',
                level: course.skillLevel || course.level || course.difficulty || '',
                levelCode: normalizedSkillLevel || 'all',
                rating: toNumber(apiCourse.rating),
                students: studentsCount,
                lessonsCount,
                duration: formatDurationFromMinutes(durationMinutes, t),
                language: course.language || '-',
                deadline: formatDisplayDate(
                    course.enrollmentDeadline ||
                    course.deadline ||
                    course.publishedAt ||
                    course.updatedAt ||
                    course.createdAt,
                    locale,
                ),
                image: apiCourse.thumbnail || '/assets/img/courses/01.jpg',
                description: apiCourse.description || t('qualityCourse'),
                descriptionEn: course.descriptionEn || null,
                details: fullDetails || apiCourse.description || t('qualityCourse'),
                detailsEn: fullDetailsEn || course.descriptionEn || null,
                isFree: toNumber(apiCourse.price) <= 0,
                enrolledCount: studentsCount,
                hasCertificate: Boolean(course.hasCertificate),
                previewVideo,
                lessons,
                relatedCourses: Array.isArray(apiCourse.relatedCourses)
                    ? apiCourse.relatedCourses.map((relatedCourse: any) => ({
                        id: Number(relatedCourse.id),
                        title: relatedCourse.title,
                        titleEn: relatedCourse.titleEn || null,
                        description: relatedCourse.description || null,
                        descriptionEn: relatedCourse.descriptionEn || null,
                        thumbnail: relatedCourse.thumbnail || '/assets/img/courses/01.jpg',
                        authorName: relatedCourse.authorName || relatedCourse.instructor?.name || t('instructorFallback'),
                        price: toNumber(relatedCourse.price),
                        cpeCredits: toNumber(relatedCourse.cpeCredits),
                        enrolledCount: toNumber(relatedCourse.enrolledCount ?? relatedCourse.enrollmentsCount),
                        durationMinutes: toNumber(relatedCourse.durationMinutes),
                        totalDurationSeconds: toNumber(relatedCourse.totalDurationSeconds),
                        rating: toNumber(relatedCourse.rating),
                        reviewsCount: toNumber(relatedCourse.reviewsCount),
                        lessonsCount: toNumber(relatedCourse.lessonsCount),
                        audience: relatedCourse.audience || 'all',
                        category: relatedCourse.category || null,
                    }))
                    : [],
                localizedTitle: getLocalizedContent(appLocale, apiCourse.title, apiCourse.titleEn) || t('fallbackCourseTitle'),
                rawCourse: apiCourse,
            };
        }
    } catch (e) {
        // API failed; course not found
    }

    if (!initialCourseData) {
        notFound();
    }

    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <BreadcrumbCoursesDetails courseTitle={initialCourseData.localizedTitle} />
            <CoursesDetailsArea initialData={initialCourseData} />
            <RelatedCourses courses={initialCourseData.relatedCourses} />
            <MarqueeOne style_2={true} />
            <FooterTwo />
        </Wrapper>
    );
}
