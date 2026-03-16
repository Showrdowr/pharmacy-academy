import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import BreadcrumbCoursesDetails from '@/components/common/breadcrumb/BreadcrumbCoursesDetails';
import { CoursesDetailsArea, RelatedCourses } from '@/features/courses';
import { coursesService } from '@/features/courses/services/coursesApi';
import { COURSES_DATA } from '@/features/courses/data/mockData';

// Dynamic Open Graph & Metadata generation
export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        // Find course data either from API or mock
        // For phase 3 we try API first
        let courseTitle = "รายละเอียดคอร์ส - Pharmacy Academy";
        let courseDesc = "รายละเอียดคอร์สเรียน";
        let courseImage = "assets/img/courses/01.jpg";

        try {
            const apiCourse = await coursesService.getCourseDetail(Number(resolvedParams.id));
            if (apiCourse) {
                courseTitle = `${apiCourse.title} - Pharmacy Academy`;
                courseDesc = apiCourse.description || courseDesc;
                courseImage = apiCourse.thumbnail || courseImage;
            }
        } catch (e) {
            // Fallback to mock
            const mockCourse = COURSES_DATA.find(c => c.id.toString() === resolvedParams.id);
            if (mockCourse) {
                courseTitle = `${mockCourse.title} - Pharmacy Academy`;
                courseDesc = mockCourse.description || courseDesc;
                courseImage = mockCourse.image || courseImage;
            }
        }

        return {
            title: courseTitle,
            description: courseDesc,
            openGraph: {
                title: courseTitle,
                description: courseDesc,
                images: [courseImage],
            }
        };
    } catch (error) {
        return {
            title: "รายละเอียดคอร์ส - Pharmacy Academy",
            description: "รายละเอียดคอร์สเรียน",
        };
    }
}

export default async function CourseDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const courseId = Number(resolvedParams.id);

    if (isNaN(courseId)) {
        notFound();
    }

    let initialCourseData = null;

    try {
        // Attempt SSR Fetch
        const apiCourse = await coursesService.getCourseDetail(courseId);
        if (apiCourse) {
            // Map API response to Component UI Format (Zero UI Breakage Pattern)
            initialCourseData = {
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
                description: apiCourse.description || 'คอร์สเรียนคุณภาพ',
            };
        } else {
            // If api returned success but null data, fallback to mock directly
            initialCourseData = COURSES_DATA.find((c) => c.id === courseId) || null;
        }
    } catch (e) {
        console.warn(`SSR API Fetch failed for course ${courseId}, falling back to mock data.`, e);
        initialCourseData = COURSES_DATA.find((c) => c.id === courseId) || null;
    }

    // If course really doesn't exist anywhere
    if (!initialCourseData) {
        notFound();
    }

    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <BreadcrumbCoursesDetails />
            <CoursesDetailsArea initialData={initialCourseData} />
            <RelatedCourses />
            <MarqueeOne style_2={true} />
            <FooterTwo />
        </Wrapper>
    );
}
