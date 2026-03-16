import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import BreadcrumbCourses from '@/components/common/breadcrumb/BreadcrumbCourses';
import { CoursesGridArea } from '@/features/courses';
import { coursesService } from '@/features/courses/services/coursesApi';
import { COURSES_DATA, Course } from '@/features/courses/data/mockData';

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

    let initialData: Course[] = COURSES_DATA;

    try {
        // Attempt to perform SSR Fetching via actual API
        const response = await coursesService.getCourses({
            search,
            // Cast to CourseCategory if it matched, but for now we pass as any or strictly mapped
            category: categoryQuery as any,
            limit: 12
        });

        // Map API response to UI Mock Data format to prevent ANY UI breakages
        if (response && response.courses && response.courses.length > 0) {
            initialData = response.courses.map((apiCourse) => ({
                id: apiCourse.id,
                title: apiCourse.title,
                titleEn: apiCourse.title,
                category: apiCourse.category || 'อื่นๆ',
                categoryEn: apiCourse.category || 'Other',
                instructor: apiCourse.instructor?.name || 'Unknown Instructor',
                cpe: apiCourse.cpeCredits || 0,
                price: apiCourse.price,
                level: 'All Level',
                rating: apiCourse.rating || 5,
                students: apiCourse.reviewsCount || 0,
                duration: `${Math.round((apiCourse.duration || 0) / 60)} ชั่วโมง`,
                image: apiCourse.thumbnail || 'assets/img/courses/01.jpg',
                description: 'คอร์สเรียนคุณภาพ',
            }));
        }
    } catch (e) {
        console.warn("SSR API Fetch failed, falling back to mock data.", e);
        // Fallback to COURSES_DATA gracefully if the backend is offline
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
