import React from 'react';
import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import BreadcrumbCourses from '@/components/common/breadcrumb/BreadcrumbCourses';
import { CoursesGridArea } from '@/features/courses';
import { formatCourseDuration, resolveCourseDurationMinutes, resolveCourseStudentsCount } from '@/features/courses/course-card-display';
import { coursesService } from '@/features/courses/services/coursesApi';
import { getLocalizedContent } from '@/features/i18n';
import type { AppLocale } from '@/i18n/config';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('courses.grid');

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        keywords: t('metaKeywords').split(',').map((keyword) => keyword.trim()),
    };
}

export default async function CoursesGridPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams;
    const locale = await getLocale();
    const appLocale: AppLocale = locale === 'en' ? 'en' : 'th';
    const t = await getTranslations('courses.grid');
    const detailT = await getTranslations('courses.detail');

    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
    const categoryQuery = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;

    let initialData: any[] = [];

    try {
        const response = await coursesService.getCourses({
            search,
            category: categoryQuery as any,
            limit: 12,
        });

        const mapApiCourseToGridCourse = (apiCourse: any) => {
            const categoryValue = apiCourse.category;
            const categoryName = typeof categoryValue === 'string'
                ? categoryValue
                : categoryValue?.name || t('fallbackCategory');
            const categoryNameEn = typeof categoryValue === 'object'
                ? categoryValue?.nameEn || categoryValue?.name || categoryName
                : categoryName;

            return {
                id: apiCourse.id,
                title: apiCourse.title,
                titleEn: apiCourse.titleEn || apiCourse.title,
                category: categoryName,
                categoryEn: categoryNameEn,
                instructor: apiCourse.authorName || apiCourse.instructor?.name || t('fallbackInstructor'),
                cpe: apiCourse.cpeCredits || 0,
                price: Number(apiCourse.price) || 0,
                audience: apiCourse.audience || 'all',
                level: t('fallbackLevel'),
                rating: Number(apiCourse.rating) || 0,
                reviewsCount: Number(apiCourse.reviewsCount) || 0,
                students: resolveCourseStudentsCount(apiCourse),
                duration: formatCourseDuration(
                    resolveCourseDurationMinutes(apiCourse),
                    detailT,
                    t('fallbackDuration'),
                ),
                image: apiCourse.thumbnail || '/assets/img/courses/01.jpg',
                description: getLocalizedContent(appLocale, apiCourse.description, apiCourse.descriptionEn) || t('fallbackDescription'),
            };
        };

        if (response && Array.isArray(response)) {
            initialData = response.map(mapApiCourseToGridCourse);
        } else if (response && response.courses) {
            initialData = response.courses.map(mapApiCourseToGridCourse);
        }
    } catch (e) {
        // API failed; show empty grid
    }

    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <BreadcrumbCourses title={t('pageTitle')} subtitle={t('pageSubtitle')} />
            <CoursesGridArea initialCourses={initialData} />
            <FooterTwo />
        </Wrapper>
    );
}
