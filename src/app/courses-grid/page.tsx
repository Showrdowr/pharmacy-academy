import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import BreadcrumbCourses from '@/components/common/breadcrumb/BreadcrumbCourses';
import { CoursesGridArea } from '@/features/courses';
import { coursesService } from '@/features/courses/services/coursesApi';

export const metadata: Metadata = {
    title: "คอร์สเรียน - Pharmacy Academy",
    description: "สำรวจคอร์สเรียนทั้งหมด",
    keywords: "Online Course, Education, Pharmacy",
};

export default async function CoursesGridPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Await searchParams in Next.js 15
    const resolvedParams = await searchParams;

    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
    const categoryQuery = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;

    let initialData: any[] = [];

    try {
        const response = await coursesService.getCourses({
            search,
            category: categoryQuery as any,
            limit: 12
        });

        if (response && Array.isArray(response)) {
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
        }
    } catch (e) {
        // API failed — show empty grid
    }

    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <BreadcrumbCourses title="คอร์สเรียนทั้งหมด" subtitle="คอร์สเรียน" />
            <CoursesGridArea initialCourses={initialData} />
            <FooterTwo />
        </Wrapper>
    );
}
