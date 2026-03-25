"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAddToCart } from '@/features/cart/hooks';
import type { CartItem } from '@/features/cart/types';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/lib/api';
import { coursesService } from '@/features/courses/services/coursesApi';
import { getCourseViewerRole, isCourseRestrictedForViewer, normalizeCourseAudience } from '@/features/courses/audience';
import type { EnrolledCourse } from '@/features/courses/types';
import { getLocalizedContent, useAppLocale } from '@/features/i18n';
import { isFreeCourse } from '../utils';
import { CoursePreviewVideoModal } from './CoursePreviewVideoModal';
import VideoPopup from '@/components/common/VideoPopup';
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
    initialData?: any;
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
    return '';
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

type CourseDetailTranslator = (key: string, values?: Record<string, string | number | Date>) => string;

function getSkillLevelLabel(levelCode: unknown, fallbackLabel: unknown, t: CourseDetailTranslator) {
    const normalized = typeof levelCode === 'string' ? levelCode.trim().toLowerCase() : '';

    switch (normalized) {
        case 'beginner':
            return t('skillLevelBeginner');
        case 'intermediate':
            return t('skillLevelIntermediate');
        case 'advanced':
            return t('skillLevelAdvanced');
        case 'all':
        case 'all-level':
        case 'all level':
            return t('skillLevelAll');
        default:
            return typeof fallbackLabel === 'string' && fallbackLabel.trim() ? fallbackLabel : t('skillLevelAll');
    }
}

function getLanguageLabel(language: unknown, t: CourseDetailTranslator) {
    if (typeof language !== 'string' || !language.trim()) {
        return '-';
    }

    const normalized = language.trim().toLowerCase();
    if (normalized === 'thai' || normalized === 'th' || normalized === 'ไทย') {
        return t('languageThai');
    }

    if (normalized === 'english' || normalized === 'en' || normalized === 'อังกฤษ') {
        return t('languageEnglish');
    }

    return language;
}

const CoursesDetailsArea: React.FC<CoursesDetailsAreaProps> = ({ initialData }) => {
    const t = useTranslations('courses.detail');
    const audienceT = useTranslations('courses.audience');
    const { locale } = useAppLocale();
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { addToCart } = useAddToCart();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isEnrollmentLoading, setIsEnrollmentLoading] = useState(false);
    const [ctaError, setCtaError] = useState('');
    const autoEnrollProcessedRef = useRef(false);

    const title = getLocalizedContent(locale, initialData?.title, initialData?.titleEn) || t('fallbackCourseTitle');
    const courseId = Number(initialData?.id || 0);
    const parsedPrice = Number(initialData?.price);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    const isFree = isFreeCourse(price);
    const instructorName = initialData?.instructor || initialData?.authorName || t('instructorFallback');
    const coverImage = initialData?.image || '/assets/img/courses/details-1.jpg';
    const [coverImageSrc, setCoverImageSrc] = useState(() => normalizeImageSrc(coverImage));
    const shortDescription = getLocalizedContent(locale, initialData?.description, initialData?.descriptionEn) || t('qualityCourse');
    const fullDescription = getLocalizedContent(locale, initialData?.details, initialData?.detailsEn) || shortDescription;
    const category = getLocalizedContent(locale, initialData?.category, initialData?.categoryEn) || getCategoryLabel(initialData?.category) || t('otherCategory');
    const subcategoryName = typeof initialData?.subcategory === 'string'
        ? getLocalizedContent(locale, initialData.subcategory, initialData?.subcategoryEn)
        : getLocalizedContent(locale, initialData?.subcategory?.name, initialData?.subcategory?.nameEn) || undefined;
    const lessonsCount = Number.isFinite(Number(initialData?.lessonsCount))
        ? Number(initialData.lessonsCount)
        : initialData?.lessons?.length || 0;
    const languageText = getLanguageLabel(initialData?.language, t);
    const skillLevelText = getSkillLevelLabel(initialData?.levelCode, initialData?.level, t);
    const previewVideo = initialData?.previewVideo ?? null;
    const canPlayPreviewVideo = isPreviewVideoReady(previewVideo);
    const matchingEnrollment = enrolledCourses.find((course) => course.courseId === courseId || course.id === courseId);
    const enrollmentStatus = matchingEnrollment?.enrollmentStatus ?? null;
    const refundRequestStatus = matchingEnrollment?.refundRequestStatus ?? matchingEnrollment?.refundRequest?.status ?? null;
    const isEnrolled = enrollmentStatus === 'ACTIVE';
    const canReEnrollFreeCourse = isFree && enrollmentStatus === 'CANCELLED';
    const isRefundPending = enrollmentStatus === 'REFUND_PENDING' && refundRequestStatus === 'PENDING';
    const isRefundApproved = enrollmentStatus === 'REFUND_PENDING' && refundRequestStatus === 'APPROVED';
    const isRefundRejected = enrollmentStatus === 'REFUND_PENDING' && refundRequestStatus === 'REJECTED';
    const shouldAutoStartFree = searchParams.get('intent') === 'start-free';
    const cpeCredits = Number(initialData?.cpeCredits) || Number(initialData?.cpe) || 0;
    const ratingParam = Number(initialData?.rating);
    const rating = Number.isFinite(ratingParam) ? ratingParam : 0;
    const conferenceCode = initialData?.conferenceCode || '-';
    const publishedAt = initialData?.publishedAt || null;
    const createdAt = initialData?.createdAt || new Date().toISOString();
    const updatedAt = initialData?.updatedAt || new Date().toISOString();
    const courseAudience = normalizeCourseAudience(initialData?.audience);
    const viewerRole = getCourseViewerRole(user, isAuthenticated);
    const isRestrictedCourse = isCourseRestrictedForViewer(courseAudience, viewerRole);
    const courseAudienceLabel = audienceT(courseAudience);

    useEffect(() => {
        setCoverImageSrc(normalizeImageSrc(coverImage));
    }, [coverImage]);

    const loadEnrolledCourses = useCallback(async () => {
        if (!isAuthenticated) {
            setEnrolledCourses([]);
            return;
        }

        try {
            const courses = await coursesService.getEnrolledCourses('all');
            setEnrolledCourses(courses);
        } catch {
            setEnrolledCourses([]);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        void loadEnrolledCourses();
    }, [loadEnrolledCourses]);

    const courseData: CartItem = {
        id: courseId || 999,
        title,
        price,
        originalPrice: isFree ? undefined : price + 500,
        image: coverImage,
        instructor: instructorName,
        rating: initialData?.rating || 4.8,
        category,
        credits: cpeCredits,
        cpe: cpeCredits,
        audience: courseAudience,
    };

    const startFreeCourse = useCallback(async () => {
        if (!courseId) {
            setCtaError(t('courseNotFound'));
            return;
        }

        if (isAuthLoading) {
            return;
        }

        setCtaError('');

        if (isRestrictedCourse) {
            setCtaError(t('roleForbiddenError'));
            return;
        }

        if (!isAuthenticated) {
            sessionStorage.setItem('redirectAfterLogin', `/courses/${courseId}?intent=start-free`);
            router.push('/sign-in');
            return;
        }

        if (isEnrolled) {
            router.push(`/course-learning?courseId=${courseId}`);
            return;
        }

        if (isRefundPending) {
            setCtaError(t('refundPendingError'));
            return;
        }

        if (isRefundApproved) {
            setCtaError(t('refundApprovedError'));
            return;
        }

        if (isRefundRejected) {
            setCtaError(t('refundRejectedError'));
            return;
        }

        try {
            setIsEnrollmentLoading(true);
            await coursesService.enrollCourse(courseId);
            await loadEnrolledCourses();
            router.push(`/course-learning?courseId=${courseId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : t('enrollFailed');
            if (error instanceof ApiError && error.code === 'COURSE_FULL') {
                setCtaError(t('courseFull'));
            } else if (error instanceof ApiError && error.code === 'COURSE_ROLE_FORBIDDEN') {
                setCtaError(t('roleForbiddenError'));
            } else {
                setCtaError(message);
            }
        } finally {
            setIsEnrollmentLoading(false);
        }
    }, [courseId, isAuthLoading, isAuthenticated, isEnrolled, isRefundApproved, isRefundPending, isRefundRejected, isRestrictedCourse, loadEnrolledCourses, router, t]);

    useEffect(() => {
        if (!isFree || !shouldAutoStartFree || autoEnrollProcessedRef.current || isAuthLoading || !isAuthenticated) {
            return;
        }

        autoEnrollProcessedRef.current = true;
        void startFreeCourse();
    }, [isAuthLoading, isAuthenticated, isFree, shouldAutoStartFree, startFreeCourse]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFree || isRestrictedCourse) {
            if (isRestrictedCourse) {
                setCtaError(t('roleForbiddenError'));
            }
            return;
        }
        addToCart(courseData);
    };

    const handleBuyCourse = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isRestrictedCourse) {
            setCtaError(t('roleForbiddenError'));
            return;
        }
        if (isFree) {
            void startFreeCourse();
            return;
        }
        addToCart(courseData);
        router.push('/checkout');
    };

    return (
        <>
            {canPlayPreviewVideo && previewVideo?.playbackUrl ? (
                <CoursePreviewVideoModal
                    isOpen={isVideoOpen}
                    onClose={() => setIsVideoOpen(false)}
                    playbackUrl={previewVideo.playbackUrl}
                    title={previewVideo.name || title}
                />
            ) : (
                <VideoPopup
                    isVideoOpen={isVideoOpen}
                    setIsVideoOpen={setIsVideoOpen}
                    videoId={"Ml4XCF-JS0k"}
                />
            )}
            <section className="courses-details-section section-padding pt-0" style={{ fontSize: '30px' }}>
                <div className="container">
                    <div className="courses-details-wrapper">
                        <div className="row g-4">
                            <div className="col-lg-8">
                                <div className="courses-details-items">
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
                                                alt={title}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                onError={() => setCoverImageSrc(FALLBACK_IMAGE)}
                                            />
                                        ) : (
                                            <Image
                                                src={coverImageSrc}
                                                alt={title}
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
                                                aria-label={t('previewAriaLabel')}
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
                                                {t('previewUnavailable')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="courses-details-content">
                                        {isRestrictedCourse ? (
                                            <div
                                                style={{
                                                    border: '1px solid #fed7aa',
                                                    background: '#fff7ed',
                                                    borderRadius: '16px',
                                                    padding: '28px',
                                                }}
                                            >
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    borderRadius: '999px',
                                                    background: '#f97316',
                                                    color: '#fff',
                                                    padding: '6px 12px',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    marginBottom: '16px',
                                                }}>
                                                    {courseAudienceLabel}
                                                </div>
                                                <h3 style={{ fontSize: '34px', color: '#9a3412', marginBottom: '12px' }}>
                                                    {t('accessDeniedTitle')}
                                                </h3>
                                                <p style={{ fontSize: '20px', color: '#7c2d12', lineHeight: 1.7, marginBottom: '16px' }}>
                                                    {t('accessDeniedDescription', { audience: courseAudienceLabel })}
                                                </p>
                                                <p style={{ fontSize: '18px', color: '#9a3412', lineHeight: 1.7, marginBottom: '24px' }}>
                                                    {shortDescription}
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                    <Link href="/courses-grid" className="theme-btn">
                                                        {t('accessDeniedBrowseCourses')}
                                                    </Link>
                                                    <Link href="/profile" className="theme-btn style-2">
                                                        {t('accessDeniedGoProfile')}
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <DescriptionSection
                                                    shortDescription={shortDescription}
                                                    fullDescription={fullDescription}
                                                />

                                                <LessonsSection
                                                    lessons={initialData?.lessons || []}
                                                    title={t('lessonsTitle')}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="courses-sidebar-area sticky-style">
                                    {ctaError && (
                                        <div
                                            style={{
                                                marginBottom: '12px',
                                                border: '1px solid #fecaca',
                                                background: '#fef2f2',
                                                color: '#b91c1c',
                                                borderRadius: '10px',
                                                padding: '10px 12px',
                                                fontSize: '15px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            {ctaError}
                                        </div>
                                    )}
                                    {isRestrictedCourse ? (
                                        <div className="courses-items mb-4">
                                            <div className="courses-content p-4 interactive-card" style={{ border: '1px solid #fed7aa', borderRadius: '12px', backgroundColor: '#fff7ed' }}>
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="fas fa-user-shield" style={{ fontSize: '28px', color: '#f97316' }}></i>
                                                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#9a3412' }}>{t('accessDeniedTitle')}</h5>
                                                </div>
                                                <p style={{ fontSize: '18px', color: '#9a3412', lineHeight: '1.7', marginBottom: '18px' }}>
                                                    {t('accessDeniedDescription', { audience: courseAudienceLabel })}
                                                </p>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    borderRadius: '999px',
                                                    background: '#ffedd5',
                                                    color: '#9a3412',
                                                    padding: '6px 12px',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    marginBottom: '18px',
                                                }}>
                                                    {courseAudienceLabel}
                                                </div>
                                                <div className="courses-btn d-flex gap-2 flex-column">
                                                    <Link href="/courses-grid" className="theme-btn">
                                                        {t('accessDeniedBrowseCourses')}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ) : isRefundPending || isRefundApproved || isRefundRejected ? (
                                        <div className="courses-items mb-4">
                                            <div className="courses-content p-4 interactive-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className={`fas ${isRefundPending ? 'fa-hourglass-half' : isRefundApproved ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ fontSize: '28px', color: isRefundPending ? '#d97706' : isRefundApproved ? '#16a34a' : '#dc2626' }}></i>
                                                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                                                        {isRefundPending ? t('refundPendingTitle') : isRefundApproved ? t('refundApprovedTitle') : t('refundRejectedTitle')}
                                                    </h5>
                                                </div>
                                                <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.7', marginBottom: '18px' }}>
                                                    {isRefundPending ? t('refundPendingDescription') : isRefundApproved ? t('refundApprovedDescription') : t('refundRejectedDescription')}
                                                </p>
                                                <div className="courses-btn d-flex gap-2 flex-column">
                                                    <Link href="/profile" className="theme-btn">
                                                        {t('viewProfileStatus')}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <PriceCard
                                                isFree={isFree}
                                                price={price}
                                                shortDescription={shortDescription}
                                                onAddToCart={handleAddToCart}
                                                onBuyCourse={handleBuyCourse}
                                                onStartFreeCourse={startFreeCourse}
                                                enrolling={isEnrollmentLoading || isAuthLoading}
                                                startFreeLabel={canReEnrollFreeCourse ? t('reEnrollFree') : undefined}
                                            />

                                            <CPECard cpe={cpeCredits} />
                                        </>
                                    )}

                                    <CategoryCard
                                        category={category}
                                        subcategory={subcategoryName}
                                    />

                                    <CourseInfoCard
                                        instructor={instructorName}
                                        lessonsCount={lessonsCount}
                                        rating={rating}
                                        conferenceCode={conferenceCode}
                                        skillLevel={skillLevelText}
                                        language={languageText}
                                    />

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
