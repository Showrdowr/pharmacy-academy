"use client"
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/features/i18n';
import { CATEGORIES, PRICE_RANGES, Course } from '../data/mockData';
import CourseCard from './CourseCard';
import { useCourseFilter } from '../hooks/useCourseFilter';

interface CoursesGridAreaProps {
    initialCourses?: Course[];
}

const CoursesGridArea: React.FC<CoursesGridAreaProps> = ({ initialCourses }) => {
    const { language, t } = useLanguage();
    const {
        searchQuery,
        selectedCategory,
        selectedPriceRange,
        isFilterOpen,
        filteredCourses,
        totalCourses,
        setSearchQuery,
        setSelectedCategory,
        setSelectedPriceRange,
        setIsFilterOpen,
        clearFilters,
    } = useCourseFilter({ initialCourses });


    return (
        <>
            <section className="courses-section section-padding fix">
                <div className="container">
                    <div className="row g-4">
                        {/* Sidebar Filters */}
                        <div className="col-xl-3 col-lg-4">
                            <div className="courses-main-sidebar-area">
                                {/* Filter Toggle Button */}
                                <button
                                    className={`filter-toggle-btn ${isFilterOpen ? 'open' : ''}`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <span>
                                        <i className="fas fa-filter me-2"></i>
                                        {t('ค้นหา / คัดกรองคอร์ส', 'Search / Filter Courses')}
                                    </span>
                                    <i className="fas fa-chevron-down"></i>
                                </button>

                                {/* Collapsible Filter Content */}
                                <div className={`filter-content ${isFilterOpen ? 'open' : ''}`}>
                                    <div className="courses-main-sidebar">
                                        {/* Search */}
                                        <div className="courses-sidebar-items">
                                            <div className="wid-title style-2">
                                                <h5 style={{ fontSize: '20px', fontWeight: 'bold' }}>{t('ค้นหา', 'Search')}</h5>
                                            </div>
                                            <div className="search-widget">
                                                <form onSubmit={e => e.preventDefault()}>
                                                    <input
                                                        type="text"
                                                        placeholder={t('ค้นหาคอร์สเรียน', 'Search courses')}
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        style={{ color: '#333', fontSize: '18px' }}
                                                    />
                                                    <button type="submit"><i className="fal fa-search"></i></button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Price Range Filter */}
                                        <div className="courses-sidebar-items">
                                            <div className="wid-title">
                                                <h5 style={{ fontSize: '20px', fontWeight: 'bold' }}>{t('ช่วงราคา', 'Price Range')}</h5>
                                            </div>
                                            <div className="courses-list">
                                                {PRICE_RANGES.map((range, index) => (
                                                    <label key={index} className="checkbox-single">
                                                        <span className="d-flex gap-xl-3 gap-2 align-items-center">
                                                            <span className="checkbox-area d-center">
                                                                <input
                                                                    type="radio"
                                                                    name="priceRange"
                                                                    checked={selectedPriceRange === index}
                                                                    onChange={() => setSelectedPriceRange(index)}
                                                                />
                                                                <span className="checkmark d-center"></span>
                                                            </span>
                                                            <span className="text-color" style={{ fontSize: '18px' }}>
                                                                {language === 'th' ? range.label : range.labelEn}
                                                            </span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Category Filter */}
                                        <div className="courses-sidebar-items">
                                            <div className="wid-title">
                                                <h5 style={{ fontSize: '20px', fontWeight: 'bold' }}>{t('หมวดหมู่', 'Category')}</h5>
                                            </div>
                                            <div className="courses-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {CATEGORIES.map((cat) => (
                                                    <label key={cat.id} className="checkbox-single">
                                                        <span className="d-flex gap-xl-3 gap-2 align-items-center">
                                                            <span className="checkbox-area d-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCategory === cat.id}
                                                                    onChange={() => setSelectedCategory(cat.id)}
                                                                />
                                                                <span className="checkmark d-center"></span>
                                                            </span>
                                                            <span className="text-color" style={{ fontSize: '20px' }}>{language === 'th' ? cat.label : cat.labelEn}</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={clearFilters} className="theme-btn" style={{ width: '100%', fontSize: '20px', fontWeight: 'bold' }}>
                                        <i className="far fa-times-circle me-2"></i>{t('ล้างตัวกรอง', 'Clear Filters')}
                                    </button>
                                </div>
                            </div> {/* End filter-content */}
                        </div>

                        {/* Courses Grid */}
                        <div className="col-xl-9 col-lg-8">
                            <div className="coureses-notices-wrapper">
                                <div className="courses-showing">
                                    <div className="icon-items">
                                        <Link href="/courses-grid"><i className="fas fa-th"></i></Link>
                                    </div>
                                    <h5>{t('แสดง', 'Showing')} <span>1-{filteredCourses.length}</span> {t('จาก', 'of')} <span>{totalCourses}</span> {t('คอร์ส', 'Courses')}</h5>
                                </div>
                            </div>

                            {filteredCourses.length === 0 ? (
                                <div className="no-results text-center py-5">
                                    <i className="fas fa-search" style={{ fontSize: '48px', color: '#ddd', marginBottom: '20px' }}></i>
                                    <h5 style={{ color: '#666' }}>{t('ไม่พบคอร์สที่ตรงกับเงื่อนไข', 'No courses match your criteria')}</h5>
                                    <p style={{ color: '#999' }}>{t('ลองเปลี่ยนคำค้นหาหรือตัวกรอง', 'Try changing your search or filters')}</p>
                                    <button onClick={clearFilters} className="theme-btn mt-3">{t('ดูคอร์สทั้งหมด', 'View All Courses')}</button>
                                </div>
                            ) : (
                                <div className="row">
                                    {filteredCourses.map((course) => (
                                        <div key={course.id} className="col-xl-4 col-lg-6 col-md-6">
                                            <CourseCard course={course} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CoursesGridArea;