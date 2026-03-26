/**
 * CourseCard Component
 * Displays a course card with hover state
 * Extracted from CoursesGridArea.tsx for SOLID SRP compliance
 */

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import EnrollButton from '@/components/common/EnrollButton';
import { normalizeCourseAudience } from '@/features/courses/audience';
import { getLocalizedContent, useAppLocale } from '@/features/i18n';
import { COURSE_FALLBACK_IMAGE, normalizeCourseImageSrc, shouldUseNativeImageTag } from '@/features/courses/image-src';
import type { Course } from '../data/mockData';
import { formatCoursePrice } from '../utils';

interface CourseCardProps {
    course: Course;
}

function normalizeRating(rating: number) {
    if (!Number.isFinite(rating)) return 0;
    return Math.min(5, Math.max(0, rating));
}

function normalizeReviewsCount(reviewsCount?: number) {
    if (!Number.isFinite(reviewsCount)) return 0;
    return Math.max(0, Math.floor(reviewsCount ?? 0));
}

function renderStars(rating: number) {
    return [1, 2, 3, 4, 5].map((star) => {
        const isFilled = rating >= star;
        const isHalf = !isFilled && rating >= star - 0.5;

        return (
            <i
                key={star}
                className={isFilled ? 'fas fa-star' : isHalf ? 'fas fa-star-half-alt' : 'far fa-star'}
                style={{ color: isFilled || isHalf ? '#f6c453' : '#cbd5e1' }}
            />
        );
    });
}

function renderReviewSummary(rating: number, reviewsCount?: number) {
    const normalizedRating = normalizeRating(rating);
    const normalizedReviewsCount = normalizeReviewsCount(reviewsCount);

    if (normalizedReviewsCount === 0) {
        return (
            <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                aria-label="No reviews yet"
            >
                {renderStars(0)}
            </span>
        );
    }

    return (
        <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 }}
            aria-label={`${normalizedRating.toFixed(1)} out of 5 from ${normalizedReviewsCount} reviews`}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                {renderStars(normalizedRating)}
            </span>
            <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {normalizedRating.toFixed(1)} ({normalizedReviewsCount})
            </span>
        </span>
    );
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { locale } = useAppLocale();
    const t = useTranslations('courses.card');
    const audienceT = useTranslations('courses.audience');
    const [imageSrc, setImageSrc] = useState(() => normalizeCourseImageSrc(course.image));
    const courseTitle = getLocalizedContent(locale, course.title, course.titleEn);
    const courseCategory = getLocalizedContent(locale, course.category, course.categoryEn);
    const audience = normalizeCourseAudience(course.audience);
    const showAudienceBadge = audience !== 'all';
    const audienceLabel = audienceT(audience);

    useEffect(() => {
        setImageSrc(normalizeCourseImageSrc(course.image));
    }, [course.image]);

    return (
        <div className="courses-card-main-items">
            {/* Default card state */}
            <div className="courses-card-items" style={{ marginTop: '15px' }}>
                <div className="courses-image" style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    {shouldUseNativeImageTag(imageSrc) ? (
                        <img
                            src={imageSrc}
                            alt={courseTitle}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={() => setImageSrc(COURSE_FALLBACK_IMAGE)}
                        />
                    ) : (
                        <Image
                            src={imageSrc}
                            alt={courseTitle}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 300px"
                            onError={() => setImageSrc(COURSE_FALLBACK_IMAGE)}
                        />
                    )}
                    
                    
                </div>
                <div className="courses-content">
                    <h5>
                        <Link href={`/courses/${course.id}`}>{courseTitle}</Link>
                    </h5>
                    {showAudienceBadge && (
                        <div style={{ marginTop: '-4px', marginBottom: '8px' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '999px',
                                background: audience === 'pharmacist' ? '#ede9fe' : '#cffafe',
                                color: audience === 'pharmacist' ? '#6d28d9' : '#0f766e',
                                padding: '4px 10px',
                                fontSize: '13px',
                                fontWeight: 700,
                            }}>
                                {audienceLabel}
                            </span>
                        </div>
                    )}
                    <h4 className="text-force-20 text-force-bold" style={{ marginTop: '5px', marginBottom: '15px', color: '#ffc107' }}>
                        {formatCoursePrice(course.price, locale)}
                    </h4>
                    <div className="client-items">
                        <div
                            className="client-img bg-cover"
                            style={{ background: `url(/assets/img/courses/client-1.png)` }}
                        />
                        <p>{course.instructor}</p>
                    </div>
                    <ul className="post-cat" style={{ marginTop: '10px', marginBottom: '15px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                        <li style={{ minWidth: 0, flexShrink: 1 }}>
                            <Link href="/courses-grid" style={{ fontSize: '16px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', verticalAlign: 'middle' }}>{courseCategory}</Link>
                        </li>
                        <li style={{ flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                            {renderReviewSummary(course.rating, course.reviewsCount)}
                        </li>
                    </ul>
                    <ul className="post-class">
                        <li>
                            <i className="far fa-clock" />
                            {course.duration}
                        </li>
                        <li>
                            <i className="far fa-user" />
                            {course.students} {t('students')}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Hover state card */}
            <div
                className="courses-card-items-hover"
                style={{
                    marginTop: 20,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                }}
            >
                <div className="courses-content" style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    gap: '6px',
                }}>
                    <h5 style={{ margin: 0, flexShrink: 0 }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {courseTitle}
                        </span>
                    </h5>
                    {showAudienceBadge && (
                        <div style={{ flexShrink: 0 }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '999px',
                                background: audience === 'pharmacist' ? '#ede9fe' : '#cffafe',
                                color: audience === 'pharmacist' ? '#6d28d9' : '#0f766e',
                                padding: '4px 10px',
                                fontSize: '13px',
                                fontWeight: 700,
                            }}>
                                {audienceLabel}
                            </span>
                        </div>
                    )}
                    <h4 className="text-force-20 text-force-bold" style={{ margin: 0, flexShrink: 0 }}>{formatCoursePrice(course.price, locale)}</h4>
                    <span className="text-force-16" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5', flexShrink: 1, minHeight: 0 }}>{course.description}</span>
                    <div className="client-items" style={{ marginTop: 0, flexShrink: 0 }}>
                        <div
                            className="client-img bg-cover"
                            style={{ background: `url(/assets/img/courses/client-1.png)` }}
                        />
                        <p style={{ margin: 0 }}>{course.instructor}</p>
                    </div>
                    <ul className="post-cat" style={{ marginBottom: 0, flexShrink: 0, marginTop: '10px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                        <li style={{ minWidth: 0, flexShrink: 1 }}>
                            <Link href="/courses-grid" style={{ fontSize: '16px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', verticalAlign: 'middle' }}>{courseCategory}</Link>
                        </li>
                        <li style={{ flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                            {renderReviewSummary(course.rating, course.reviewsCount)}
                        </li>
                    </ul>
                    <ul className="post-class" style={{ marginBottom: 0, flexShrink: 0 }}>
                        <li>
                            <i className="far fa-clock" />
                            {course.duration}
                        </li>
                        <li>
                            <i className="far fa-user" />
                            {course.students} {t('students')}
                        </li>
                    </ul>
                    <div style={{ marginTop: 20, flexShrink: 0, width: '100%' }}>
                        <EnrollButton courseId={course.id} audience={audience} className="theme-btn yellow-btn">
                            <span className="text-force-20 text-force-bold" style={{ lineHeight: '1' }}>
                                {t('enrollNow')}
                            </span>
                        </EnrollButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
