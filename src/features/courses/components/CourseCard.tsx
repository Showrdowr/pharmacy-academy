/**
 * CourseCard Component
 * Displays a course card with hover state
 * Extracted from CoursesGridArea.tsx for SOLID SRP compliance
 */

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import EnrollButton from '@/components/common/EnrollButton';
import { useLanguage } from '@/features/i18n';
import type { Course } from '../data/mockData';

interface CourseCardProps {
    course: Course;
}

function normalizeImageSrc(src?: string): string {
    if (!src) return '/assets/img/courses/01.jpg';
    if (/^(https?:\/\/|data:|blob:)/i.test(src)) return src;
    return src.startsWith('/') ? src : `/${src}`;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { t } = useLanguage();

    return (
        <div className="courses-card-main-items">
            {/* Default card state */}
            <div className="courses-card-items" style={{ marginTop: '15px' }}>
                <div className="courses-image" style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    <Image
                        src={normalizeImageSrc(course.image)}
                        alt={course.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 300px"
                    />
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
                    <h4 className="text-force-20 text-force-bold" style={{ marginBottom: '-4px' }}>฿{course.price.toLocaleString()}</h4>
                    <span className="text-force-16" style={{ display: 'block', marginBottom: '2px', lineHeight: '1.4' }}>{course.description}</span>
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
