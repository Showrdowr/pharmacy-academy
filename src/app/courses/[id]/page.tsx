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

function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatDurationFromMinutes(minutesValue: unknown): string {
    const totalMinutes = Math.round(toNumber(minutesValue));
    if (totalMinutes <= 0) return '-';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours} ชม. ${minutes} นาที`;
    if (hours > 0) return `${hours} ชม.`;
    return `${minutes} นาที`;
}

function formatDisplayDate(value: unknown): string {
    if (!value) return '-';

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

// Dynamic Open Graph & Metadata generation
export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const apiCourse = await coursesService.getCourseDetail(Number(resolvedParams.id));
        const courseTitle = `${apiCourse.title} - Pharmacy Academy`;
        const courseDesc = apiCourse.description || apiCourse.details || 'รายละเอียดคอร์สเรียน';
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
            }
        };
    } catch (error) {
        return {
            title: 'รายละเอียดคอร์ส - Pharmacy Academy',
            description: 'รายละเอียดคอร์สเรียน',
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
        const apiCourse = await coursesService.getCourseDetail(courseId);
        if (apiCourse) {
            const course = apiCourse as any;
            const categoryValue = course.category;
            const categoryName =
                typeof categoryValue === 'object'
                    ? categoryValue?.name
                    : categoryValue;

            const lessons = Array.isArray(course.lessons) ? course.lessons : [];
            const lessonsCount = toNumber(course.lessonsCount) || lessons.length;
            const lessonVideoDurationSeconds = lessons.reduce(
                (sum: number, lesson: any) => sum + toNumber(lesson?.video?.duration),
                0
            );
            const durationMinutes =
                toNumber(course.duration) || Math.round(lessonVideoDurationSeconds / 60);
            const normalizedSkillLevel = String(
                course.skillLevel || course.level || course.difficulty || ''
            ).toLowerCase();
            const skillLevelLabel =
                normalizedSkillLevel === 'beginner'
                    ? 'Beginner'
                    : normalizedSkillLevel === 'intermediate'
                        ? 'Intermediate'
                        : normalizedSkillLevel === 'advanced'
                            ? 'Advanced'
                            : 'All Level';
            const studentsCount =
                toNumber(course.studentsCount) ||
                toNumber(course.enrollmentsCount) ||
                toNumber(course.enrollments) ||
                toNumber(course.reviewsCount);
            const certifications =
                typeof course.hasCertificate === 'boolean'
                    ? course.hasCertificate
                        ? 'Yes'
                        : 'No'
                    : typeof course.certifications === 'string'
                        ? course.certifications
                        : '-';
            const fullDetails =
                (typeof course.details === 'string' && course.details.trim()) ||
                (typeof apiCourse.details === 'string' && apiCourse.details.trim()) ||
                apiCourse.description ||
                'คอร์สเรียนคุณภาพ';

            initialCourseData = {
                id: apiCourse.id,
                title: apiCourse.title,
                titleEn: apiCourse.title,
                category: categoryName || 'อื่นๆ',
                categoryEn: categoryName || 'Other',
                instructor: apiCourse.instructor?.name || course.authorName || 'ผู้สอน',
                cpe: apiCourse.cpeCredits || 0,
                price: toNumber(apiCourse.price),
                level: skillLevelLabel,
                rating: toNumber(apiCourse.rating),
                students: studentsCount,
                lessonsCount,
                duration: formatDurationFromMinutes(durationMinutes),
                language: course.language || '-',
                deadline: formatDisplayDate(
                    course.enrollmentDeadline ||
                    course.deadline ||
                    course.publishedAt ||
                    course.updatedAt ||
                    course.createdAt
                ),
                certifications,
                image: apiCourse.thumbnail || '/assets/img/courses/01.jpg',
                description: apiCourse.description || 'คอร์สเรียนคุณภาพ',
                details: fullDetails,
            };
        }
    } catch (e) {
        // API failed — course not found
    }

    if (!initialCourseData) {
        notFound();
    }

    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <BreadcrumbCoursesDetails courseTitle={initialCourseData.title} />
            <CoursesDetailsArea initialData={initialCourseData} />
            <RelatedCourses />
            <MarqueeOne style_2={true} />
            <FooterTwo />
        </Wrapper>
    );
}
