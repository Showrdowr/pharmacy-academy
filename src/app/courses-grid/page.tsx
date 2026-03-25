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
    // Await searchParams in Next.js 15
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
            limit: 12
        });

        const mapApiCourseToGridCourse = (apiCourse: any) => ({
            id: apiCourse.id,
            title: apiCourse.title,
            titleEn: apiCourse.titleEn || apiCourse.title,
            category: apiCourse.category?.name || t('fallbackCategory'),
            categoryEn: apiCourse.category?.nameEn || apiCourse.category?.name || t('fallbackCategory'),
            instructor: apiCourse.authorName || t('fallbackInstructor'),
            cpe: apiCourse.cpeCredits || 0,
            price: Number(apiCourse.price) || 0,
            audience: apiCourse.audience || 'all',
            level: t('fallbackLevel'),
            rating: 5,
            students: resolveCourseStudentsCount(apiCourse),
            duration: formatCourseDuration(
                resolveCourseDurationMinutes(apiCourse),
                detailT,
                t('fallbackDuration'),
            ),
            image: apiCourse.thumbnail || '/assets/img/courses/01.jpg',
            description: getLocalizedContent(appLocale, apiCourse.description, apiCourse.descriptionEn) || t('fallbackDescription'),
        });

        if (response && Array.isArray(response)) {
<<<<<<< HEAD
            initialData = response.map((apiCourse: any) => ({
                id: apiCourse.id,
                title: apiCourse.title,
                titleEn: apiCourse.title,
                category: apiCourse.category?.name || 'อื่นๆ',
                categoryEn: apiCourse.category?.name || 'Other',
                instructor: apiCourse.authorName || 'ผู้สอน',
                cpe: apiCourse.cpeCredits || 0,
                price: Number(apiCourse.price) || 0,
                level: 'All Level',
                rating: Number(apiCourse.rating) || 0,
                students: 0,
                duration: '0 ชั่วโมง',
                image: apiCourse.thumbnail || '/assets/img/courses/01.jpg',
                description: apiCourse.description || 'คอร์สเรียนคุณภาพ',
            }));
        } else if (response && response.courses) {
            initialData = response.courses.map((apiCourse: any) => ({
                id: apiCourse.id,
                title: apiCourse.title,
                titleEn: apiCourse.title,
                category: apiCourse.category?.name || 'อื่นๆ',
                categoryEn: apiCourse.category?.name || 'Other',
                instructor: apiCourse.authorName || 'ผู้สอน',
                cpe: apiCourse.cpeCredits || 0,
                price: Number(apiCourse.price) || 0,
                level: 'All Level',
                rating: Number(apiCourse.rating) || 0,
                students: 0,
                duration: '0 ชั่วโมง',
                image: apiCourse.thumbnail || '/assets/img/courses/01.jpg',
                description: apiCourse.description || 'คอร์สเรียนคุณภาพ',
            }));
=======
            initialData = response.map(mapApiCourseToGridCourse);
        } else if (response && response.courses) {
            initialData = response.courses.map(mapApiCourseToGridCourse);
>>>>>>> 8afa68e (feat: add Thai localization across core application sections)
        }
    } catch (e) {
        // API failed — show empty grid
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
