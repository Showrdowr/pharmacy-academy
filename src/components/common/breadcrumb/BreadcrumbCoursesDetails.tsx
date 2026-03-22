
import Link from 'next/link';
import React from 'react';

interface BreadcrumbCoursesDetailsProps {
    courseTitle?: string;
}

const BreadcrumbCoursesDetails: React.FC<BreadcrumbCoursesDetailsProps> = ({ courseTitle = 'Course Details' }) => {
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
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/courses-grid">Courses</Link></li>
                            <li className="style-2"> Course Details</li>
                        </ul>
                        <div className="breadcrumb-content" style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '480px' }}>{courseTitle}</h1>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BreadcrumbCoursesDetails;