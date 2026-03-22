"use client"
import Link from 'next/link';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAddToCart } from '@/features/cart/hooks';
import type { CartItem } from '@/features/cart/types';
import { coursesService } from '@/features/courses/services/coursesApi';
import { useAuth } from '@/features/auth';
import './CoursesDetailsArea.css';
import {
    PriceCard,
    CPECard,
    CategoryCard,
    CourseInfoCard,
    TimelineCard,
} from './SidebarCards';
import {
    DescriptionSection,
    LessonsSection,
} from './CourseContentSections';

interface CoursesDetailsAreaProps {
    initialData?: any; // To allow flexibility for Zero UI Breakage Pattern
}

const FALLBACK_IMAGE = '/assets/img/courses/01.jpg';
const EXTERNAL_IMAGE_PATTERN = /^(https?:\/\/|data:|blob:)/i;
const BASE64_PATTERN = /^[A-Za-z0-9+/=\r\n]+$/;

function getCategoryLabel(category: unknown): string {
    if (typeof category === 'string') return category;
    if (category && typeof category === 'object' && 'name' in category) {
        const name = (category as { name?: unknown }).name;
        if (typeof name === 'string') return name;
    }
    return 'Development';
}

function normalizeImageSrc(src?: string): string {
    if (!src) return FALLBACK_IMAGE;

    const normalized = src.trim();
    if (!normalized) return FALLBACK_IMAGE;
    if (EXTERNAL_IMAGE_PATTERN.test(normalized)) return normalized;
    if (normalized.startsWith('/')) return normalized;

    const sanitized = normalized.replace(/\s+/g, '');
    if (sanitized.length > 100 && BASE64_PATTERN.test(sanitized)) {
        return `data:image/jpeg;base64,${sanitized}`;
    }

    return `/${normalized}`;
}

function isPreviewVideoReady(video: {
    status?: string | null;
    duration?: number | null;
    playbackUrl?: string | null;
} | null | undefined) {
    return video?.status === 'READY' && Number(video.duration ?? 0) > 0 && Boolean(video.playbackUrl);
}

const CoursesDetailsArea: React.FC<CoursesDetailsAreaProps> = ({ initialData }) => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { addToCart } = useAddToCart();
    const { isAuthenticated } = useAuth();

    const title = initialData?.title || initialData?.titleEn || "Web Development";
    const courseId = Number(initialData?.id || 0);
    const parsedPrice = Number(initialData?.price);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    const isFree = price === 0;
    const instructorName = initialData?.instructor || initialData?.authorName || "Mario S. Davis";
    const coverImage = initialData?.image || "/assets/img/courses/details-1.jpg";
    const [coverImageSrc, setCoverImageSrc] = useState(() => normalizeImageSrc(coverImage));
    const shortDescription = initialData?.description || "คอร์สเรียนคุณภาพ";
    const fullDescription = initialData?.details || shortDescription;
    const category = getCategoryLabel(initialData?.category);
    const subcategoryName = typeof initialData?.subcategory === 'string' 
        ? initialData.subcategory 
        : initialData?.subcategory?.name || undefined;
    const lessonsCount = Number.isFinite(Number(initialData?.lessonsCount))
        ? Number(initialData.lessonsCount)
        : initialData?.lessons?.length || 0;
    const cpeCredits = Number(initialData?.cpeCredits) || 0;
    const rating = Number(initialData?.rating) || 4.5;
    const conferenceCode = initialData?.conferenceCode || '-';
    const skillLevelText = typeof initialData?.level === 'string' ? initialData.level : 'All Level';
    const languageText = typeof initialData?.language === 'string' ? initialData.language : '-';
    const status = initialData?.status || 'DRAFT';
    const publishedAt = initialData?.publishedAt || null;
    const createdAt = initialData?.createdAt || new Date().toISOString();
    const updatedAt = initialData?.updatedAt || new Date().toISOString();

    useEffect(() => {
        setCoverImageSrc(normalizeImageSrc(coverImage));
    }, [coverImage]);

    const courseData: CartItem = {
        id: courseId || 999,
        title: title,
        price: price,
        originalPrice: price + 500,
        image: coverImage,
        instructor: instructorName,
        rating: initialData?.rating || 4.8,
        category: category,
        credits: cpeCredits,
        cpe: cpeCredits
    };

    const startFreeCourse = useCallback(async () => {
        if (!courseId) {
            setCtaError('ไม่พบข้อมูลคอร์สที่ต้องการ');
            return;
        }

        if (isAuthLoading) {
            return;
        }

        setCtaError('');

        if (!isAuthenticated) {
            sessionStorage.setItem('redirectAfterLogin', `/courses/${courseId}?intent=start-free`);
            router.push('/sign-in');
            return;
        }

        if (isEnrolled) {
            router.push(`/course-learning?courseId=${courseId}`);
            return;
        }

        try {
            setIsEnrollmentLoading(true);
            await coursesService.enrollCourse(courseId);
            await loadEnrolledCourses();
            router.push(`/course-learning?courseId=${courseId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'สมัครเรียนไม่สำเร็จ';
            if (message.includes('COURSE_FULL') || message.toLowerCase().includes('course is full')) {
                setCtaError('คอร์สนี้เต็มแล้ว');
            } else {
                setCtaError(message);
            }
        } finally {
            setIsEnrollmentLoading(false);
        }
    }, [courseId, isAuthLoading, isAuthenticated, isEnrolled, loadEnrolledCourses, router]);

    useEffect(() => {
        if (!isFree || !shouldAutoStartFree || autoEnrollProcessedRef.current || isAuthLoading || !isAuthenticated) {
            return;
        }

        autoEnrollProcessedRef.current = true;
        void startFreeCourse();
    }, [isAuthLoading, isAuthenticated, isFree, shouldAutoStartFree, startFreeCourse]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFree) return;
        addToCart(courseData);
    };

    const handleBuyCourse = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFree) {
            void startFreeCourse();
            return;
        }
        addToCart(courseData);
        router.push('/checkout');
    };

    const [enrolling, setEnrolling] = React.useState(false);

    const handleStartFreeCourse = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            sessionStorage.setItem('redirectAfterLogin', `/courses/${initialData?.id}`);
            router.push('/sign-in');
            return;
        }
        try {
            setEnrolling(true);
            await coursesService.enrollCourse(initialData?.id);
            router.push(`/course-learning?id=${initialData?.id}`);
        } catch (err) {
            console.error('Enroll failed:', err);
            router.push(`/course-learning?id=${initialData?.id}`);
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <>
            {/* Video Modal */}
            <VideoPopup
                isVideoOpen={isVideoOpen}
                setIsVideoOpen={setIsVideoOpen}
                videoId={"Ml4XCF-JS0k"}
            />

            <section className="courses-details-section section-padding pt-0" style={{ fontSize: '30px' }}>
                <div className="container">
                    <div className="courses-details-wrapper">
                        <div className="row g-4">
                            {/* Main Content Area (8 columns) */}
                            <div className="col-lg-8">
                                <div className="courses-details-items">
                                    {/* Video Player Section */}
                                    <div className="courses-image" style={{
                                        position: 'relative',
                                        height: '500px',
                                        overflow: 'hidden',
                                        width: '100%',
                                        marginBottom: '40px',
                                        borderRadius: '12px'
                                    }}>
                                        {coverImageSrc.startsWith('data:') ? (
                                            <img
                                                src={coverImageSrc}
                                                alt="cover"
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                onError={() => setCoverImageSrc(FALLBACK_IMAGE)}
                                            />
                                        ) : (
                                            <Image
                                                src={coverImageSrc}
                                                alt="cover"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 800px"
                                                priority
                                                onError={() => setCoverImageSrc(FALLBACK_IMAGE)}
                                            />
                                        )}
                                        {canPlayPreviewVideo && (
                                            <button
                                                type="button"
                                                onClick={() => setIsVideoOpen(true)}
                                                style={{ cursor: "pointer", background: 'transparent', border: 'none', padding: 0 }}
                                                className="video-btn ripple video-popup"
                                                aria-label="เปิดวิดีโอตัวอย่างคอร์ส"
                                            >
                                                <i className="fas fa-play"></i>
                                            </button>
                                        )}
                                        {!canPlayPreviewVideo && previewVideo && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: '20px',
                                                    bottom: '20px',
                                                    borderRadius: '999px',
                                                    background: 'rgba(15, 23, 42, 0.72)',
                                                    color: '#fff',
                                                    padding: '8px 14px',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                วิดีโอตัวอย่างยังไม่พร้อมใช้งาน
                                            </div>
                                        )}
                                    </div>

                                    {/* New Sections: Description & Lessons */}
                                    <div className="courses-details-content">
                                        <DescriptionSection
                                            shortDescription={shortDescription}
                                            fullDescription={fullDescription}
                                        />

                                        <LessonsSection
                                            lessons={initialData?.lessons || []}
                                            title="เนื้อหาในบทเรียน"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Area (4 columns) - New Card-Based Layout */}
                            <div className="col-lg-4">
                                <div className="courses-sidebar-area sticky-style">
                                    {/* Price Card */}
                                    <PriceCard
                                        isFree={isFree}
                                        price={price}
                                        shortDescription={shortDescription}
                                        onAddToCart={handleAddToCart}
                                        onBuyCourse={handleBuyCourse}
                                        onStartFreeCourse={handleStartFreeCourse}
                                        enrolling={enrolling}
                                    />

                                    {/* CPE Credits Card (Conditional) */}
                                    <CPECard cpe={cpeCredits} />

                                    {/* Category Card */}
                                    <CategoryCard
                                        category={category}
                                        subcategory={subcategoryName}
                                    />

                                    {/* Course Info Card */}
                                    <CourseInfoCard
                                        instructor={instructorName}
                                        lessonsCount={lessonsCount}
                                        rating={rating}
                                        conferenceCode={conferenceCode}
                                        skillLevel={skillLevelText}
                                        language={languageText}
                                    />

                                    {/* Timeline Card */}
                                    <TimelineCard
                                        publishedAt={publishedAt}
                                        createdAt={createdAt}
                                        updatedAt={updatedAt}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CoursesDetailsArea;
