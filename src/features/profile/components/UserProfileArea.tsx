"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useLanguage } from '@/features/i18n';
import { api } from '@/lib/api';

interface EnrolledCourseData {
    id: number;
    courseId: number;
    progressPercent: string;
    isCompleted: boolean;
    enrolledAt: string;
    course: {
        id: number;
        title: string;
        authorName: string | null;
        cpeCredits: number;
        thumbnail: string | null;
        category?: { name: string } | null;
        lessons?: any[];
    };
}

const UserProfileArea = () => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const { t } = useLanguage();

    // Edit name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    // Real enrolled courses from API
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchEnrolled = async () => {
            try {
                setIsLoadingCourses(true);
                const response = await api.get<EnrolledCourseData[]>('/courses/my-courses');
                if (response.success && response.data) {
                    setEnrolledCourses(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchEnrolled();
    }, [isAuthenticated]);

    // Compute stats from real data
    const stats = {
        totalCourses: enrolledCourses.length,
        inProgress: enrolledCourses.filter(e => !e.isCompleted).length,
        completed: enrolledCourses.filter(e => e.isCompleted).length,
        totalCPE: enrolledCourses.reduce((sum, e) => sum + (e.course?.cpeCredits || 0), 0),
    };

    if (!isAuthenticated || !user) {
        return (
            <section className="profile-section section-padding">
                <div className="container">
                    <div className="text-center py-5">
                        <h3>{t('กรุณาเข้าสู่ระบบ', 'Please sign in')}</h3>
                        <Link href="/sign-in" className="theme-btn mt-3">{t('เข้าสู่ระบบ', 'Sign In')}</Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="profile-section section-padding" style={{ background: '#f8f9fa', minHeight: '80vh' }}>
            <div className="container">
                {/* Profile Header */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div style={{
                            background: 'linear-gradient(135deg, #004736 0%, #006B52 100%)',
                            borderRadius: '20px',
                            padding: '40px',
                            color: '#fff',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="text-resp-h1" style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '20px',
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#004736',
                                            fontWeight: 'bold'
                                        }}>
                                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h2 style={{ margin: 0, fontWeight: '700', color: '#fff' }}>{user.fullName}</h2>
                                            </div>
                                            <p style={{ margin: '0 0 5px', opacity: 0.9 }}>
                                                <i className="fas fa-envelope me-2"></i>{user.email}
                                            </p>
                                            {/* CPE for mobile - inside info section */}
                                            <div className="cpe-mobile" style={{ display: 'none' }}>
                                                <span className="text-resp-body-lg" style={{ fontWeight: 'bold' }}>{stats.totalCPE}</span>
                                                <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: '3px' }}>CPE</span>
                                                <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>{t('หน่วยกิตสะสม', 'Accumulated Credits')}</span>
                                            </div>
                                            <span className="pharmacist-badge" style={{
                                                display: 'inline-block',
                                                padding: '5px 15px',
                                                background: 'rgba(255,255,255,0.2)',
                                                borderRadius: '20px',
                                                fontSize: '14px'
                                            }}>
                                                {user.role === 'pharmacist' ? t('👨‍⚕️ เภสัชกร', '👨‍⚕️ Pharmacist') : t('👤 ผู้ใช้ทั่วไป', '👤 General User')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 text-md-end mt-4 mt-md-0 cpe-desktop">
                                    <div className="text-resp-h1" style={{ fontWeight: 'bold' }}>
                                        {stats.totalCPE}
                                        <span className="text-resp-body-lg" style={{ opacity: 0.8, marginLeft: '5px' }}>CPE</span>
                                    </div>
                                    <p style={{ margin: 0, opacity: 0.8 }}>{t('หน่วยกิตสะสม', 'Accumulated Credits')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-3 col-md-6">
                        <div style={{
                            background: '#fff',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                            borderLeft: '4px solid #004736'
                        }}>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: '#e8f8f4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-book" style={{ color: '#004736', fontSize: '24px' }}></i>
                                </div>
                                <div>
                                    <h3 className="text-resp-h3" style={{ margin: 0, color: '#004736', fontWeight: 'bold' }}>{stats.totalCourses}</h3>
                                    <p className="text-resp-body-lg" style={{ margin: 0, color: '#666' }}>{t('คอร์สทั้งหมด', 'Total Courses')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div style={{
                            background: '#fff',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                            borderLeft: '4px solid #f59e0b'
                        }}>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: '#fef3c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-spinner" style={{ color: '#f59e0b', fontSize: '24px' }}></i>
                                </div>
                                <div>
                                    <h3 className="text-resp-h3" style={{ margin: 0, color: '#f59e0b', fontWeight: 'bold' }}>{stats.inProgress}</h3>
                                    <p className="text-resp-body-lg" style={{ margin: 0, color: '#666' }}>{t('กำลังเรียน', 'In Progress')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div style={{
                            background: '#fff',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                            borderLeft: '4px solid #22c55e'
                        }}>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: '#dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-check-circle" style={{ color: '#22c55e', fontSize: '24px' }}></i>
                                </div>
                                <div>
                                    <h3 className="text-resp-h3" style={{ margin: 0, color: '#22c55e', fontWeight: 'bold' }}>{stats.completed}</h3>
                                    <p className="text-resp-body-lg" style={{ margin: 0, color: '#666' }}>{t('เรียนจบแล้ว', 'Completed')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div style={{
                            background: '#fff',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                            borderLeft: '4px solid #8b5cf6'
                        }}>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: '#ede9fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-certificate" style={{ color: '#8b5cf6', fontSize: '24px' }}></i>
                                </div>
                                <div>
                                    <h3 className="text-resp-h3" style={{ margin: 0, color: '#8b5cf6', fontWeight: 'bold' }}>{stats.totalCPE}</h3>
                                    <p className="text-resp-body-lg" style={{ margin: 0, color: '#666' }}>{t('CPE สะสม', 'CPE Credits')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className="row">
                    <div className="col-12">
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
                        }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="text-resp-h3" style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>{t('คอร์สเรียนของฉัน', 'My Courses')}</h4>
                                <Link href="/courses-grid" className="theme-btn text-resp-btn" style={{ padding: '12px 24px', fontWeight: 'bold' }}>
                                    {t('ค้นหาคอร์สเพิ่ม', 'Find More Courses')}
                                </Link>
                            </div>

                            <div className="course-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {isLoadingCourses ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#004736' }}></i>
                                        <p className="mt-3" style={{ color: '#666' }}>{t('กำลังโหลดข้อมูลคอร์ส...', 'Loading courses...')}</p>
                                    </div>
                                ) : enrolledCourses.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-book-open" style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }}></i>
                                        <h5 style={{ color: '#666' }}>{t('ยังไม่มีคอร์สเรียน', 'No courses yet')}</h5>
                                        <p style={{ color: '#999' }}>{t('เริ่มต้นเรียนรู้กับคอร์สดีๆ ได้เลย', 'Start learning with great courses')}</p>
                                        <Link href="/courses-grid" className="theme-btn mt-2">
                                            {t('ค้นหาคอร์ส', 'Browse Courses')}
                                        </Link>
                                    </div>
                                ) : (
                                    enrolledCourses.map((enrollment) => {
                                        const course = enrollment.course;
                                        const progress = Math.round(parseFloat(enrollment.progressPercent || '0'));
                                        const isCompleted = enrollment.isCompleted || progress >= 100;
                                        const status = isCompleted ? 'completed' : 'in_progress';

                                        return (
                                            <div key={enrollment.id} className="course-card" style={{
                                                background: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '20px',
                                                transition: 'box-shadow 0.3s ease',
                                                position: 'relative',
                                            }}>
                                                {/* Course Icon */}
                                                <div className="course-card-icon" style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #004736 0%, #006B52 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <i className="fas fa-book-open" style={{ fontSize: '28px', color: '#fff' }}></i>
                                                </div>

                                                {/* Course Info */}
                                                <div className="course-card-info" style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="course-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <h5 className="course-card-title text-resp-body-lg" style={{ margin: 0, color: '#333', fontWeight: '600' }}>
                                                            {course?.title || 'คอร์สเรียน'}
                                                        </h5>
                                                        {status === 'completed' && (
                                                            <span className="course-card-badge completed" style={{
                                                                background: '#dcfce7',
                                                                color: '#22c55e',
                                                                padding: '3px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                <i className="fas fa-check me-1"></i>{t('เรียนจบแล้ว', 'Completed')}
                                                            </span>
                                                        )}
                                                        {status === 'in_progress' && (
                                                            <span className="course-card-badge in-progress" style={{
                                                                background: '#fef3c7',
                                                                color: '#f59e0b',
                                                                padding: '4px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {t('กำลังเรียน', 'In Progress')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="course-card-meta text-resp-body-lg" style={{ margin: '0 0 10px', color: '#666' }}>
                                                        <i className="fas fa-user me-2"></i>{course?.authorName || '-'}
                                                        <span style={{ margin: '0 10px', color: '#ddd' }}>|</span>
                                                        <i className="fas fa-certificate me-1"></i>{course?.cpeCredits || 0} {t('หน่วยกิต', 'Credits')}
                                                    </p>
                                                    {/* Progress Bar */}
                                                    <div className="course-card-progress" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            flex: 1,
                                                            height: '8px',
                                                            background: '#e5e7eb',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${progress}%`,
                                                                height: '100%',
                                                                background: progress >= 100 ? '#22c55e' : '#004736',
                                                                borderRadius: '4px'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ color: '#666', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                                            {progress}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="course-card-actions" style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                                    {progress >= 100 ? (
                                                        <>
                                                            <DownloadButton t={t} />
                                                        </>
                                                    ) : (
                                                        <Link
                                                            href={`/course-learning?id=${course?.id || enrollment.courseId}`}
                                                            className="course-card-btn text-resp-btn"
                                                            style={{
                                                                padding: '12px 24px',
                                                                background: '#004736',
                                                                color: '#fff',
                                                                borderRadius: '8px',
                                                                textDecoration: 'none',
                                                                fontWeight: 'bold',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {t('เรียนต่อ', 'Continue')}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const DownloadButton = ({ t }: { t: any }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={() => alert(t('กำลังดาวน์โหลดหนังสือรับรอง...', 'Downloading Certificate...'))}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                height: '42px',
                padding: isHovered ? '0 20px' : '0',
                width: isHovered ? 'auto' : '42px',
                minWidth: '42px',
                background: '#004736',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isHovered ? '8px' : '0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
        >
            <i className="fas fa-download"></i>
            <span style={{
                maxWidth: isHovered ? '200px' : '0',
                opacity: isHovered ? 1 : 0,
                transition: 'all 0.3s ease',
                display: 'inline-block'
            }}>
                {t('ดาวน์โหลดหนังสือรับรอง', 'Download Certificate')}
            </span>
        </button>
    );
};

export default UserProfileArea;
