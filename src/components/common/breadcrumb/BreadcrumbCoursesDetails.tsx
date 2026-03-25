
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

interface BreadcrumbCoursesDetailsProps {
    courseTitle?: string;
}

const BreadcrumbCoursesDetails: React.FC<BreadcrumbCoursesDetailsProps> = ({ courseTitle }) => {
    const detailT = useTranslations('courses.detail');
    const navT = useTranslations('navigation.offCanvas');
    const resolvedCourseTitle = courseTitle || detailT('fallbackCourseTitle');

    return (
        <>
            <section className="breadcrumb-wrapper style-2">
                <div className="shape-1">
                    <img src="/assets/img/breadcrumb/shape-1.png" alt="img" />
                </div>
                <div className="shape-2">
                    <img src="/assets/img/breadcrumb/shape-2.png" alt="img" />
                </div>
                <div className="dot-shape">
                    <img src="/assets/img/breadcrumb/dot-shape.png" alt="img" />
                </div>
                <div className="vector-shape">
                    <img src="/assets/img/breadcrumb/Vector.png" alt="img" />
                </div>
                <div className="container">
                    <div className="page-heading">
                        <ul className="breadcrumb-items">
                            <li><Link href="/">{navT('home')}</Link></li>
                            <li><Link href="/courses-grid">{navT('courses')}</Link></li>
                            <li className="style-2"> {detailT('breadcrumbCurrent')}</li>
                        </ul>
                        <div className="breadcrumb-content" style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '480px' }}>{resolvedCourseTitle}</h1>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BreadcrumbCoursesDetails;
