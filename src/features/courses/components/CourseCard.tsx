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
import type { Course } from '../data/mockData';
import { formatCoursePrice } from '../utils';

interface CourseCardProps {
    course: Course;
}

const FALLBACK_IMAGE = '/assets/img/courses/01.jpg';
const EXTERNAL_IMAGE_PATTERN = /^(https?:\/\/|data:|blob:)/i;
const BASE64_PATTERN = /^[A-Za-z0-9+/=\r\n]+$/;

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

function renderStars(rating: number) {
    return [1, 2, 3, 4, 5].map((star) => {
        if (rating >= star) {
            return <i key={star} className="fas fa-star" />;
        } else if (rating >= star - 0.7) {
            return <i key={star} className="fas fa-star-half-alt" />;
        } else {
            return <i key={star} className="far fa-star" />;
        }
    });
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { locale } = useAppLocale();
    const t = useTranslations('courses.card');
    const audienceT = useTranslations('courses.audience');
    const [imageSrc, setImageSrc] = useState(() => normalizeImageSrc(course.image));
    const courseTitle = getLocalizedContent(locale, course.title, course.titleEn);
    const courseCategory = getLocalizedContent(locale, course.category, course.categoryEn);
    const audience = normalizeCourseAudience(course.audience);
    const showAudienceBadge = audience !== 'all';
    const audienceLabel = audienceT(audience);

    useEffect(() => {
        setImageSrc(normalizeImageSrc(course.image));
    }, [course.image]);

    return (
        <div className="courses-card-main-items">
            {/* Default card state */}
            <div className="courses-card-items" style={{ marginTop: '15px' }}>
                <div className="courses-image" style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    {imageSrc.startsWith('data:') ? (
                        <img
                            src={imageSrc}
                            alt={courseTitle}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={() => setImageSrc(FALLBACK_IMAGE)}
                        />
                    ) : (
                        <Image
                            src={imageSrc}
                            alt={courseTitle}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 300px"
                            onError={() => setImageSrc(FALLBACK_IMAGE)}
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
                        <li style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {renderStars(course.rating)}
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
                        <li style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {renderStars(course.rating)}
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
