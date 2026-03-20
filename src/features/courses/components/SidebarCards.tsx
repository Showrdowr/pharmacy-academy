"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CoursesSidebarProps {
    initialData?: any;
    isFree: boolean;
    price: number;
    category: string;
    title: string;
    sidebarImageSrc: string;
    sidebarDescription: string;
    onAddToCart: (e: React.MouseEvent) => void;
    onBuyCourse: (e: React.MouseEvent) => void;
    onStartFreeCourse: (e: React.MouseEvent) => void;
    enrolling: boolean;
}

const FALLBACK_IMAGE = '/assets/img/courses/01.jpg';

/**
 * Price Card Component
 */
export const PriceCard: React.FC<{
    isFree: boolean;
    price: number;
    shortDescription?: string;
    onAddToCart: (e: React.MouseEvent) => void;
    onBuyCourse: (e: React.MouseEvent) => void;
    onStartFreeCourse: (e: React.MouseEvent) => void;
    enrolling: boolean;
}> = ({ isFree, price, shortDescription, onAddToCart, onBuyCourse, onStartFreeCourse, enrolling }) => (
    <div className="courses-items mb-4">
        <div className="courses-content p-4 interactive-card" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-tag" style={{ fontSize: '28px', color: '#14b8a6' }}></i>
                <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>ราคา</h5>
            </div>
            <h3 className="text-force-bold mb-3" style={{ color: '#014d40', fontSize: '54px', fontWeight: '700' }}>
                {isFree ? 'ฟรี' : `฿${price.toLocaleString()}`}
            </h3>
            {shortDescription && (
                <p style={{ fontSize: '20px', color: '#666', marginBottom: '20px', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {shortDescription}
                </p>
            )}
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
                        {enrolling ? 'กำลังลงทะเบียน...' : 'เริ่มเรียนฟรี'}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onAddToCart}
                            className="theme-btn"
                            style={{ fontSize: '24px', width: '100%', padding: '16px', fontWeight: 'bold' }}
                        >
                            เพิ่มในตะกร้า
                        </button>
                        <button
                            onClick={onBuyCourse}
                            className="theme-btn style-2"
                            style={{ fontSize: '24px', width: '100%', padding: '16px', fontWeight: 'bold' }}
                        >
                            ซื้อคอร์สเลย
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
);

/**
 * CPE Credits Card (Conditional)
 */
export const CPECard: React.FC<{ cpe: number }> = ({ cpe }) => {
    // Only show if CPE > 0
    if (cpe <= 0) return null;

    return (
        <div className="courses-items mb-4">
            <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-certificate" style={{ fontSize: '20px', color: '#f59e0b' }}></i>
                    <h5 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>CPE Credits</h5>
                </div>
                <h3 className="text-force-bold" style={{ color: '#f59e0b', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                    {cpe} หน่วย
                </h3>
            </div>
        </div>
    );
};

/**
 * Category Card Component
 */
export const CategoryCard: React.FC<{
    category: string;
    status: string;
}> = ({ category, status }) => (
    <div className="courses-items mb-4">
        <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-folder-open" style={{ fontSize: '28px', color: '#06b6d4' }}></i>
                <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>หมวดหมู่</h5>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '16px', fontSize: '20px' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>หมวดหมู่หลัก</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#014d40', marginLeft: '8px' }}>{category}</span>
                </li>
                <li style={{ fontSize: '20px' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>สถานะ</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#14b8a6', marginLeft: '8px' }}>
                        {status === 'PUBLISHED' ? 'ตีพิมพ์แล้ว' : status === 'DRAFT' ? 'ร่างค่า' : 'จัดเก็บไว้'}
                    </span>
                </li>
            </ul>
        </div>
    </div>
);

/**
 * Course Info Card Component
 */
export const CourseInfoCard: React.FC<{
    instructor: string;
    lessonsCount: number;
    status: string;
    conferenceCode: string;
    skillLevel: string;
    language: string;
}> = ({ instructor, lessonsCount, status, conferenceCode, skillLevel, language }) => (
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
                <li style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>ความพร้อม</span>
                    <span style={{ fontWeight: '600', color: '#14b8a6' }}>{status === 'PUBLISHED' ? 'ตีพิมพ์' : 'ร่าง'}</span>
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

/**
 * Timeline Card Component
 */
export const TimelineCard: React.FC<{
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}> = ({ publishedAt, createdAt, updatedAt }) => {
    const formatDate = (date: string | null): string => {
        if (!date) return '-';
        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '-';
            return dateObj.toLocaleDateString('th-TH', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return '-';
        }
    };

    return (
        <div className="courses-items">
            <div className="courses-content p-4" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-calendar-alt" style={{ fontSize: '28px', color: '#ec4899' }}></i>
                    <h5 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>ไทม์ไลน์</h5>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '20px' }}>
                    {publishedAt && (
                        <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#22c55e' }}></i>
                            <div>
                                <span style={{ color: '#666', fontWeight: '500' }}>เผยแพร่ : </span>
                                <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(publishedAt)}</span>
                            </div>
                        </li>
                    )}
                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-pencil-alt" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                        <div>
                            <span style={{ color: '#666', fontWeight: '500' }}>อัปเดต : </span>
                            <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(updatedAt)}</span>
                        </div>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-plus-circle" style={{ fontSize: '24px', color: '#a855f7' }}></i>
                        <div>
                            <span style={{ color: '#666', fontWeight: '500' }}>สร้างเมื่อ : </span>
                            <span style={{ fontWeight: '600', color: '#333' }}>{formatDate(createdAt)}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};
