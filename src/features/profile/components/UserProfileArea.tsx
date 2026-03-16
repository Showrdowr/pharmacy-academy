"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useLanguage } from '@/features/i18n';

const UserProfileArea = () => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const { t } = useLanguage();

    // Edit name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    // Mock data for courses
    const enrolledCourses = [
        {
            id: 1,
            title: 'เภสัชวิทยาคลินิกเบื้องต้น',
            instructor: 'ภก.สมชาย ใจดี',
            cpe: 2.5,
            progress: 75,
            status: 'in_progress'
        },
        {
            id: 2,
            title: 'การบริบาลเภสัชกรรมผู้ป่วยเบาหวาน',
            instructor: 'ภก.วิชัย สุขใจ',
            cpe: 3.0,
            progress: 30,
            status: 'in_progress'
        },
        {
            id: 3,
            title: 'กฎหมายเภสัชกรรมเบื้องต้น',
            instructor: 'ภก.ประสิทธิ์ นิติกร',
            cpe: 2.0,
            progress: 100,
            status: 'completed'
        },
    ];

    const stats = {
        totalCourses: 3,
        inProgress: 2,
        completed: 1,
        totalCPE: 7.5
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
                                {enrolledCourses.map((course) => (
                                    <div key={course.id} className="course-card" style={{
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
                                                    {course.title}
                                                </h5>
                                                {course.status === 'completed' && (
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
                                                {course.status === 'in_progress' && (
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
                                                <i className="fas fa-user me-2"></i>{course.instructor}
                                                <span style={{ margin: '0 10px', color: '#ddd' }}>|</span>
                                                <i className="fas fa-certificate me-1"></i>{course.cpe} {t('หน่วยกิต', 'Credits')}
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
                                                        width: `${course.progress}%`,
                                                        height: '100%',
                                                        background: course.progress === 100 ? '#22c55e' : '#004736',
                                                        borderRadius: '4px'
                                                    }}></div>
                                                </div>
                                                <span style={{ color: '#666', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                                    {course.progress}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="course-card-actions" style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                            {course.progress === 100 ? (
                                                <>
                                                    <DownloadButton t={t} />
                                                </>
                                            ) : (
                                                <Link
                                                    href={`/course-learning?id=${course.id}`}
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
                                ))}
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