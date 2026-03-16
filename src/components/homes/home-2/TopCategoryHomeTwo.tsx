"use client"
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/features/i18n';

// SVG Icons for each pharmacology category
const CategoryIcons = {
    pharmacology: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    ),
    clinical: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
        </svg>
    ),
    care: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    ),
    herbal: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 20.5h12" />
            <path d="M12 20.5V10" />
            <path d="M12 10c0-4.4 3.6-8 8-8-4.4 0-8 3.6-8 8" />
            <path d="M12 10c0-4.4-3.6-8-8-8 4.4 0 8 3.6 8 8" />
            <path d="M12 10c3.5 0 6-2.5 6-6" />
            <path d="M12 10c-3.5 0-6-2.5-6-6" />
        </svg>
    ),
    chemistry: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3h6v2H9z" />
            <path d="M10 5v6l-5 8.5c-.5.8.1 1.5 1 1.5h12c.9 0 1.5-.7 1-1.5L14 11V5" />
            <path d="M8.5 14h7" />
        </svg>
    ),
    community: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            <circle cx="19" cy="11" r="2" />
            <path d="M19 8v6" />
            <path d="M16 11h6" />
        </svg>
    ),
    industry: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 20h20" />
            <path d="M5 20V9l5 4V9l5 4V4h4a2 2 0 0 1 2 2v14" />
            <path d="M17 8h1" />
            <path d="M17 12h1" />
        </svg>
    ),
    law: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m3 6 9-3 9 3" />
            <path d="M3 6v4c0 1.1.9 2 2 2h1" />
            <path d="M21 6v4c0 1.1-.9 2-2 2h-1" />
            <path d="M12 3v18" />
            <path d="M8 21h8" />
        </svg>
    )
};

const TopCategoryHomeTwo = () => {
    const { t } = useLanguage();

    const categories = [
        { icon: <img src="/images/01.png" alt="วิทยาลัยเภสัชบำบัด" width="70" height="70" style={{ objectFit: 'contain' }} />, name: t('วิทยาลัยเภสัชบำบัด', 'The College of Pharmcotherapy of Thailand'), courses: 12, delay: '.2s' },
        { icon: <img src="/images/02.png" alt="วิทยาลัยการคุ้มครองผู้บริโภคด้านยาฯ" width="70" height="70" style={{ objectFit: 'contain' }} />, name: t('วิทยาลัยการคุ้มครองผู้บริโภคด้านยาฯ', 'The College of Pharmaceutical and Health Consumer Protection of Thailand'), courses: 8, delay: '.4s' },
        { icon: <img src="/images/03.png" alt="วิทยาลัยเภสัชกรรมสมุนไพร" width="70" height="70" style={{ objectFit: 'contain' }} />, name: t('วิทยาลัยเภสัชกรรมสมุนไพร', 'The College of Herbal Pharmacy of Thailand'), courses: 10, delay: '.6s' },
        { icon: <img src="/images/04.png" alt="วิทยาลัยเภสัชกรรมอุตสาหการ" width="70" height="70" style={{ objectFit: 'contain' }} />, name: t('วิทยาลัยเภสัชกรรมอุตสาหการ', 'The College of Industrial Pharmacy of Thailand'), courses: 6, delay: '.8s' },
        { icon: <img src="/images/05.png" alt="วิทยาลัยเภสัชกรรมชุมชน" width="70" height="70" style={{ objectFit: 'contain' }} />, name: t('วิทยาลัยเภสัชกรรมชุมชน', 'The College of Community Pharmacy of Thailand'), courses: 5, delay: '.2s' },
        { icon: <img src="/images/06.png" alt="วิทยาลัยการบริหารเภสัชกิจ" width="70" height="70" style={{ objectFit: 'contain' }} />, name: t('วิทยาลัยการบริหารเภสัชกิจ', 'The College of Pharmacy Adimnistration of Thailand'), courses: 7, delay: '.4s' },
        { icon: CategoryIcons.industry, name: t('วิทยาลัยเภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ', 'The College of Pharmacogenomics and Precision Medicine of Thailand'), courses: 4, delay: '.6s' },
        { icon: CategoryIcons.law, name: t('อื่นๆ', 'Other'), courses: 3, delay: '.8s' }
    ];

    return (
        <>
            <section className="top-category-section-2 pb-0 section-padding fix footer-bg">
                <div className="circle-shape">
                    <img src="assets/img/circle-shape.png" alt="img" />
                </div>
                <div className="container">
                    <div className="section-title text-center">
                        <h6 className="text-white wow fadeInUp text-resp-body font-semibold uppercase tracking-wider">
                            {t('หมวดหมู่ยอดนิยม', 'Top Categories')}
                        </h6>
                        <h2 className="text-white wow fadeInUp text-resp-h2 font-bold mt-2" data-wow-delay=".3s">
                            {t('สำรวจคอร์สเรียนตามหมวดหมู่', 'Explore Courses by Category')}
                        </h2>
                    </div>
                    <div className="top-category-wrapper-2 mt-4 mt-md-0">
                        <div className="top-category-left-items">
                            <div className="row g-0">
                                {categories.map((cat, index) => (
                                    <div key={index} className="col-6 col-md-3 wow fadeInUp" data-wow-delay={cat.delay}>
                                        <div className="top-category-box">
                                            <Link href="/courses-grid">
                                                <div className="icon" style={{ color: '#014D40' }}>
                                                    {cat.icon}
                                                </div>
                                                <div className="content">
                                                    <h6 className="text-resp-body-lg font-bold mb-1">{cat.name}</h6>
                                                    <p className="text-resp-info opacity-80 mb-0">({cat.courses.toString().padStart(2, '0')}) {t('คอร์ส', 'Courses')}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="category-bottom-title wow fadeInUp" data-wow-delay=".3s">
                        <h3 className="text-resp-h3 font-bold mb-4">{t('ค้นหาคอร์สที่เหมาะกับคุณ', 'Find the Right Course for You')}</h3>
                        <Link href="/courses-grid" className="theme-btn text-resp-btn hover-white">{t('เริ่มเรียนเลย', 'Start Learning')}</Link>
                    </div>
                </div>
                <div className="mycustom-marque">
                    <div className="scrolling-wrap style-2">
                        <div className="comm">
                            <div className="cmn-textslide stroke-text">{t('คอร์สเรียน', 'Courses')}</div>
                            <div className="cmn-textslide stroke-text">{t('หมวดหมู่', 'Categories')}</div>
                        </div>
                        <div className="comm">
                            <div className="cmn-textslide stroke-text">{t('คอร์สเรียน', 'Courses')}</div>
                            <div className="cmn-textslide stroke-text">{t('หมวดหมู่', 'Categories')}</div>
                        </div>
                        <div className="comm">
                            <div className="cmn-textslide stroke-text">{t('คอร์สเรียน', 'Courses')}</div>
                            <div className="cmn-textslide stroke-text">{t('หมวดหมู่', 'Categories')}</div>
                        </div>
                        <div className="comm">
                            <div className="cmn-textslide stroke-text">{t('คอร์สเรียน', 'Courses')}</div>
                            <div className="cmn-textslide stroke-text">{t('หมวดหมู่', 'Categories')}</div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TopCategoryHomeTwo;