/**
 * CourseCard Component
 * Displays a course card with hover state
 * Extracted from CoursesGridArea.tsx for SOLID SRP compliance
 */

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import EnrollButton from '@/components/common/EnrollButton';
import { useLanguage } from '@/features/i18n';
import type { Course } from '../data/mockData';

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

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { t } = useLanguage();
    const [imageSrc, setImageSrc] = useState(() => normalizeImageSrc(course.image));

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
                            alt={course.title}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={() => setImageSrc(FALLBACK_IMAGE)}
                        />
                    ) : (
                        <Image
                            src={imageSrc}
                            alt={course.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 300px"
                            onError={() => setImageSrc(FALLBACK_IMAGE)}
                        />
                    )}
                    <h3 className="courses-title" style={{ fontSize: '30px' }}>{course.categoryEn}</h3>
                    <h4 className="topic-title">{course.cpe} CPE</h4>
                    <div className="arrow-items">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <div
                                key={num}
                                className={`GlidingArrow${num > 1 ? ` delay${num - 1}` : ''}`}
                            >
                                <Image
                                    src={`/assets/img/courses/a${num}.png`}
                                    alt="img"
                                    width={40}
                                    height={40}
                                    style={{ width: 'auto', height: 'auto' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="courses-content">
                    <ul className="post-cat">
                        <li>
                            <Link href="/courses-grid" style={{ fontSize: '16px' }}>{course.category}</Link>
                        </li>
                        <li>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i key={star} className="fas fa-star" />
                            ))}
                        </li>
                    </ul>
                    <h5>
                        <Link href={`/courses/${course.id}`}>{course.title}</Link>
                    </h5>
                    <div className="client-items">
                        <div
                            className="client-img bg-cover"
                            style={{ background: `url(/assets/img/courses/client-1.png)` }}
                        />
                        <p>{course.instructor}</p>
                    </div>
                    <ul className="post-class">
                        <li>
                            <i className="far fa-clock" />
                            {course.duration}
                        </li>
                        <li>
                            <i className="far fa-user" />
                            {course.students} {t('คน', 'students')}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Hover state card */}
            <div
                className="courses-card-items-hover"
                style={{
                    marginTop: 20,
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '450px'
                }}
            >
                <div className="courses-content" style={{ width: '100%' }}>
                    <ul className="post-cat" style={{ marginBottom: '5px' }}>
                        <li>
                            <Link href="/courses-grid" style={{ fontSize: '18px' }}>{course.category}</Link>
                        </li>
                        <li>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i key={star} className="fas fa-star" />
                            ))}
                        </li>
                    </ul>
                    <h5 style={{ marginBottom: '-12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 700 }}>
                            {course.title}
                        </span>
                    </h5>
                    <h4 className="text-force-20 text-force-bold" style={{ marginBottom: '-4px' }}>{course.price === 0 ? 'ฟรี' : `฿${course.price.toLocaleString()}`}</h4>
                    <span className="text-force-16" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxHeight: '64px', marginBottom: '12px', lineHeight: '1.6' }}>{course.description}</span>
                    <div className="client-items" style={{ marginTop: '0' }}>
                        <div
                            className="client-img bg-cover"
                            style={{ background: `url(/assets/img/courses/client-1.png)` }}
                        />
                        <p>{course.instructor}</p>
                    </div>
                    <ul className="post-class">
                        <li>
                            <i className="far fa-clock" />
                            {course.duration}
                        </li>
                        <li>
                            <i className="far fa-user" />
                            {course.students} {t('คน', 'students')}
                        </li>
                    </ul>
                    <EnrollButton courseId={course.id} className="theme-btn yellow-btn">
                        <span className="text-force-20 text-force-bold" style={{ lineHeight: '1' }}>
                            {t('สมัครเรียน', 'Enroll Now')}
                        </span>
                    </EnrollButton>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
