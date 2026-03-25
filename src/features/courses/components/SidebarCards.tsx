"use client"
import React from 'react';
import { useTranslations } from 'next-intl';
import {
    formatLocaleCurrency,
    formatLocaleDate,
    formatLocaleNumber,
    useAppLocale,
} from '@/features/i18n';

export const PriceCard: React.FC<{
    isFree: boolean;
    price: number;
    shortDescription?: string;
    onAddToCart: (e: React.MouseEvent) => void;
    onBuyCourse: (e: React.MouseEvent) => void;
    onStartFreeCourse: (e: React.MouseEvent) => void;
    enrolling: boolean;
    startFreeLabel?: string;
}> = ({ isFree, price, shortDescription, onAddToCart, onBuyCourse, onStartFreeCourse, enrolling, startFreeLabel }) => {
    const t = useTranslations('courses.detail');
    const { locale } = useAppLocale();

    return (
        <div className="courses-items mb-4">
            <div className="courses-content p-4 interactive-card" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-tag" style={{ fontSize: '28px', color: '#14b8a6' }}></i>
                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{t('priceTitle')}</h5>
                </div>
                <h3 className="text-force-bold mb-3" style={{ color: '#014d40', fontSize: '54px', fontWeight: '700' }}>
                    {isFree ? t('freeLabel') : formatLocaleCurrency(price, locale)}
                </h3>
                <p style={{ fontSize: '20px', color: '#666', marginBottom: '20px', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '64px' }}>
                    {shortDescription || t('noDescription')}
                </p>
                <div className="courses-btn d-flex gap-2 flex-column">
                    {isFree ? (
                        <button
                            onClick={onStartFreeCourse}
                            disabled={enrolling}
                            className="theme-btn"
                            style={{
                                fontSize: '24px',
                                width: '100%',
                                padding: '16px',
                                fontWeight: 'bold',
                                background: '#22c55e',
                                borderColor: '#22c55e',
                            }}
                        >
                            {enrolling ? t('enrolling') : (startFreeLabel || t('startFree'))}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onAddToCart}
                                className="theme-btn"
                                style={{ fontSize: '24px', width: '100%', padding: '16px', fontWeight: 'bold' }}
                            >
                                {t('addToCart')}
                            </button>
                            <button
                                onClick={onBuyCourse}
                                className="theme-btn style-2"
                                style={{ fontSize: '24px', width: '100%', padding: '16px', fontWeight: 'bold' }}
                            >
                                {t('buyNow')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CPECard: React.FC<{ cpe: number }> = ({ cpe }) => {
    const t = useTranslations('courses.detail');

    if (cpe <= 0) return null;

    return (
        <div className="courses-items mb-4">
            <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-certificate" style={{ fontSize: '20px', color: '#f59e0b' }}></i>
                    <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{t('cpeCredits')}</h5>
                </div>
                <h3 className="text-force-bold" style={{ color: '#f59e0b', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                    {cpe} {t('cpeUnits')}
                </h3>
            </div>
        </div>
    );
};

export const CategoryCard: React.FC<{
    category: string;
    subcategory?: string;
}> = ({ category, subcategory }) => {
    const t = useTranslations('courses.detail');

    return (
        <div className="courses-items mb-4">
            <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-folder-open" style={{ fontSize: '28px', color: '#06b6d4' }}></i>
                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{t('categoryTitle')}</h5>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '16px', fontSize: '20px' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('mainCategory')}</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#014d40', marginLeft: '8px' }}>{category}</span>
                    </li>
                    <li style={{ fontSize: '20px' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('subcategory')}</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#014d40', marginLeft: '8px' }}>{subcategory || '-'}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export const CourseInfoCard: React.FC<{
    instructor: string;
    lessonsCount: number;
    rating?: number;
    conferenceCode: string;
    skillLevel: string;
    language: string;
<<<<<<< HEAD
}> = ({ instructor, lessonsCount, rating = 0, conferenceCode, skillLevel, language }) => (
    <div className="courses-items mb-4">
        <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-chalkboard-user" style={{ fontSize: '28px', color: '#8b5cf6' }}></i>
                <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>ข้อมูลคอร์ส</h5>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '20px' }}>
                <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>ผู้สอน</span>
                    <span style={{ fontWeight: '600', color: '#333', textAlign: 'right' }}>{instructor}</span>
                </li>
                <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>บทเรียน</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>{lessonsCount} บท</span>
                </li>
                <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>คะแนนรีวิว</span>
                    <span style={{ fontWeight: '600', color: '#f59e0b', fontSize: '22px' }}>
                        {rating.toFixed(1)} 
                        <i className="fas fa-star" style={{ marginLeft: '4px', fontSize: '18px' }}></i>
                    </span>
                </li>
                <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>ระดับ</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>{skillLevel}</span>
                </li>
                <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>ภาษา</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>{language}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>Conference Code</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>{conferenceCode}</span>
                </li>
            </ul>
        </div>
    </div>
);
=======
}> = ({ instructor, lessonsCount, rating = 4.5, conferenceCode, skillLevel, language }) => {
    const t = useTranslations('courses.detail');
    const { locale } = useAppLocale();

    return (
        <div className="courses-items mb-4">
            <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-chalkboard-user" style={{ fontSize: '28px', color: '#8b5cf6' }}></i>
                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{t('courseInfoTitle')}</h5>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '20px' }}>
                    <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('instructor')}</span>
                        <span style={{ fontWeight: '600', color: '#333', textAlign: 'right' }}>{instructor}</span>
                    </li>
                    <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('lessons')}</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>{t('lessonsCount', { count: formatLocaleNumber(lessonsCount, locale) })}</span>
                    </li>
                    <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('rating')}</span>
                        <span style={{ fontWeight: '600', color: '#f59e0b', fontSize: '22px' }}>
                            {rating.toFixed(1)}
                            <i className="fas fa-star" style={{ marginLeft: '4px', fontSize: '18px' }}></i>
                        </span>
                    </li>
                    <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('level')}</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>{skillLevel}</span>
                    </li>
                    <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('language')}</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>{language}</span>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontWeight: '500' }}>{t('conferenceCode')}</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>{conferenceCode}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
>>>>>>> 8afa68e (feat: add Thai localization across core application sections)

export const TimelineCard: React.FC<{
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}> = ({ publishedAt, createdAt, updatedAt }) => {
    const t = useTranslations('courses.detail');
    const { locale } = useAppLocale();

    const formatDate = (date: string | null): string => {
        return formatLocaleDate(date, locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="courses-items">
            <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-calendar-alt" style={{ fontSize: '28px', color: '#ec4899' }}></i>
                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{t('timelineTitle')}</h5>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '20px' }}>
                    {publishedAt && (
                        <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#22c55e' }}></i>
                            <div>
                                <span style={{ color: '#666', fontWeight: '500' }}>{t('publishedAt')} : </span>
                                <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(publishedAt)}</span>
                            </div>
                        </li>
                    )}
                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-pencil-alt" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                        <div>
                            <span style={{ color: '#666', fontWeight: '500' }}>{t('updatedAt')} : </span>
                            <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(updatedAt)}</span>
                        </div>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-plus-circle" style={{ fontSize: '24px', color: '#a855f7' }}></i>
                        <div>
                            <span style={{ color: '#666', fontWeight: '500' }}>{t('createdAt')} : </span>
                            <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(createdAt)}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};
