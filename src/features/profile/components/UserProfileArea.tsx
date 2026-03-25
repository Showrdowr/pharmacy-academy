"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth';
import { isPharmacistUser } from '@/features/auth/role';
import { useEnrolledCourses } from '@/features/courses/hooks';
import { coursesService } from '@/features/courses/services';
import type { VerificationStatus } from '@/features/auth/types';
import type { EnrolledCourse } from '@/features/courses/types';
import { formatLocaleDate, useAppLocale } from '@/features/i18n';

type StatCard = {
    key: string;
    value: number;
    label: string;
    borderColor: string;
    background: string;
    icon: string;
    iconColor: string;
    valueColor: string;
};

const verificationToneMap: Record<'default' | VerificationStatus, { background: string; color: string }> = {
    default: { background: '#e2e8f0', color: '#475569' },
    pending: { background: '#fef3c7', color: '#b45309' },
    verified: { background: '#dcfce7', color: '#166534' },
    rejected: { background: '#fee2e2', color: '#b91c1c' },
};

function DownloadButton({ downloadLabel, downloadingLabel }: { downloadLabel: string; downloadingLabel: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={() => alert(downloadingLabel)}
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
            }}
        >
            <i className="fas fa-download"></i>
            <span style={{ maxWidth: isHovered ? '200px' : '0', opacity: isHovered ? 1 : 0, transition: 'all 0.3s ease', display: 'inline-block' }}>
                {downloadLabel}
            </span>
        </button>
    );
}

const UserProfileArea = () => {
    const { user, isAuthenticated } = useAuth();
    const t = useTranslations('profile.userProfile');
    const { locale } = useAppLocale();
    const {
        enrolledCourses,
        isLoading: isEnrolledCoursesLoading,
        error: enrolledCoursesError,
        refresh: refreshActiveCourses,
    } = useEnrolledCourses(isAuthenticated && !!user, 'active');
    const {
        enrolledCourses: inactiveCourses,
        isLoading: isInactiveCoursesLoading,
        error: inactiveCoursesError,
        refresh: refreshInactiveCourses,
    } = useEnrolledCourses(isAuthenticated && !!user, 'cancelled');
    const isPharmacist = isPharmacistUser(user);
    const roleLabel = isPharmacist ? t('pharmacist') : t('generalUser');
    const [cancelTarget, setCancelTarget] = useState<EnrolledCourse | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const stats = useMemo(() => {
        const completedCourses = enrolledCourses.filter((course) => course.status === 'completed');
        return {
            totalCourses: enrolledCourses.length,
            inProgress: enrolledCourses.filter((course) => course.status !== 'completed').length,
            completed: completedCourses.length,
            totalCPE: completedCourses.reduce((sum, course) => sum + Number(course.cpeCredits || 0), 0),
        };
    }, [enrolledCourses]);

    const statsCards = useMemo<StatCard[]>(() => {
        const cards: StatCard[] = [
            { key: 'totalCourses', value: stats.totalCourses, label: t('totalCourses'), borderColor: '#004736', background: '#e8f8f4', icon: 'fas fa-book', iconColor: '#004736', valueColor: '#004736' },
            { key: 'inProgress', value: stats.inProgress, label: t('inProgress'), borderColor: '#f59e0b', background: '#fef3c7', icon: 'fas fa-spinner', iconColor: '#f59e0b', valueColor: '#f59e0b' },
            { key: 'completed', value: stats.completed, label: t('completed'), borderColor: '#22c55e', background: '#dcfce7', icon: 'fas fa-check-circle', iconColor: '#22c55e', valueColor: '#22c55e' },
        ];

        if (isPharmacist) {
            cards.push({ key: 'cpeCredits', value: stats.totalCPE, label: t('cpeCredits'), borderColor: '#8b5cf6', background: '#ede9fe', icon: 'fas fa-certificate', iconColor: '#8b5cf6', valueColor: '#8b5cf6' });
        }

        return cards;
    }, [isPharmacist, stats.completed, stats.inProgress, stats.totalCPE, stats.totalCourses, t]);

    if (!isAuthenticated || !user) {
        return (
            <section className="profile-section section-padding">
                <div className="container">
                    <div className="text-center py-5">
                        <h3>{t('signInRequired')}</h3>
                        <Link href="/sign-in" className="theme-btn mt-3">{t('signIn')}</Link>
                    </div>
                </div>
            </section>
        );
    }

    const licenseNumber = user.professionalLicenseNumber?.trim() || t('licenseUnavailable');
    const verificationStatus = user.pharmacistVerificationStatus;
    const verificationLabel = verificationStatus ? t(`verificationStatus.${verificationStatus}`) : t('verificationStatus.unavailable');
    const verificationTone = verificationStatus ? verificationToneMap[verificationStatus] : verificationToneMap.default;
    const shouldShowInactiveCoursesSection = inactiveCourses.length > 0;
    const refreshEnrollmentSections = async () => {
        await Promise.all([refreshActiveCourses(), refreshInactiveCourses()]);
    };

    const closeCancelModal = () => {
        setCancelTarget(null);
        setCancelReason('');
    };

    const confirmCancelCourse = async () => {
        if (!cancelTarget) {
            return;
        }

        try {
            setIsCancelling(true);
            setActionMessage(null);
            const result = await coursesService.cancelCourse(cancelTarget.courseId || cancelTarget.id, cancelReason.trim() || undefined);
            await refreshEnrollmentSections();
            setActionMessage({
                type: 'success',
                text: result.enrollmentStatus === 'REFUND_PENDING'
                    ? t('cancelSuccessPaid')
                    : t('cancelSuccessFree'),
            });
            closeCancelModal();
        } catch (error) {
            setActionMessage({
                type: 'error',
                text: error instanceof Error ? error.message : t('cancelError'),
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const getInactiveStatusLabel = (course: EnrolledCourse) => {
        if (course.enrollmentStatus === 'REFUND_PENDING') {
            if (course.refundRequestStatus === 'APPROVED') {
                return t('refundApproved');
            }

            if (course.refundRequestStatus === 'REJECTED') {
                return t('refundRejected');
            }

            return t('refundPending');
        }

        return t('cancelled');
    };

    return (
        <section className="profile-section section-padding" style={{ background: '#f8f9fa', minHeight: '80vh' }}>
            <div className="container">
                <div className="row mb-5">
                    <div className="col-12">
                        <div style={{ background: 'linear-gradient(135deg, #004736 0%, #006B52 100%)', borderRadius: '20px', padding: '40px', color: '#fff', overflow: 'hidden' }}>
                            <div className="row align-items-center">
                                <div className={isPharmacist ? 'col-md-8' : 'col-12'}>
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="text-resp-h1" style={{ width: '100px', height: '100px', borderRadius: '20px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004736', fontWeight: 'bold' }}>
                                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: '0 0 8px', fontWeight: '700', color: '#fff' }}>{user.fullName}</h2>
                                            <p style={{ margin: '0 0 8px', opacity: 0.9 }}><i className="fas fa-envelope me-2"></i>{user.email}</p>
                                            {isPharmacist && (
                                                <div className="cpe-mobile" style={{ display: 'none' }} data-testid="profile-cpe-mobile">
                                                    <span className="text-resp-body-lg" style={{ fontWeight: 'bold' }}>{stats.totalCPE}</span>
                                                    <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: '3px' }}>CPE</span>
                                                    <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>{t('accumulatedCredits')}</span>
                                                </div>
                                            )}
                                            <span style={{ display: 'inline-block', padding: '5px 15px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>{roleLabel}</span>
                                        </div>
                                    </div>
                                </div>
                                {isPharmacist && (
                                    <div className="col-md-4 text-md-end mt-4 mt-md-0 cpe-desktop" data-testid="profile-cpe-desktop">
                                        <div className="text-resp-h1" style={{ fontWeight: 'bold' }}>
                                            {stats.totalCPE}
                                            <span className="text-resp-body-lg" style={{ opacity: 0.8, marginLeft: '5px' }}>CPE</span>
                                        </div>
                                        <p style={{ margin: 0, opacity: 0.8 }}>{t('accumulatedCredits')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isPharmacist && (
                    <div className="row g-4 mb-5" data-testid="profile-professional-info">
                        <div className="col-12">
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#e8f8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className="fas fa-id-card" style={{ color: '#004736', fontSize: '22px' }}></i>
                                    </div>
                                    <div>
                                        <h4 className="text-resp-h3" style={{ margin: 0, color: '#333', fontWeight: '700' }}>{t('professionalInfo')}</h4>
                                        <p className="text-resp-body" style={{ margin: '4px 0 0', color: '#64748b' }}>{roleLabel}</p>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '22px', height: '100%' }}>
                                            <p className="text-resp-body" style={{ margin: 0, color: '#64748b', fontWeight: '600' }}>{t('licenseNumber')}</p>
                                            <h5 className="text-resp-h3" style={{ margin: '10px 0 0', color: '#0f172a', fontWeight: '700', wordBreak: 'break-word' }}>{licenseNumber}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '22px', height: '100%' }}>
                                            <p className="text-resp-body" style={{ margin: 0, color: '#64748b', fontWeight: '600' }}>{t('verificationStatusLabel')}</p>
                                            <div style={{ marginTop: '12px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: '999px', background: verificationTone.background, color: verificationTone.color, fontSize: '14px', fontWeight: '700' }}>{verificationLabel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row g-4 mb-5">
                    {statsCards.map((card) => (
                        <div key={card.key} className={isPharmacist ? 'col-lg-3 col-md-6' : 'col-lg-4 col-md-6'} data-testid={`profile-stat-${card.key}`}>
                            <div style={{ background: '#fff', borderRadius: '15px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', borderLeft: `4px solid ${card.borderColor}` }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: card.background, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={card.icon} style={{ color: card.iconColor, fontSize: '24px' }}></i>
                                    </div>
                                    <div>
                                        <h3 className="text-resp-h3" style={{ margin: 0, color: card.valueColor, fontWeight: 'bold' }}>{card.value}</h3>
                                        <p className="text-resp-body-lg" style={{ margin: 0, color: '#666' }}>{card.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row">
                    <div className="col-12">
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="text-resp-h3" style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>{t('myCourses')}</h4>
                                <Link href="/courses-grid" className="theme-btn text-resp-btn" style={{ padding: '12px 24px', fontWeight: 'bold' }}>{t('findMoreCourses')}</Link>
                            </div>
                            {actionMessage && (
                                <div style={{
                                    marginBottom: '18px',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: `1px solid ${actionMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                                    background: actionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                    color: actionMessage.type === 'success' ? '#166534' : '#b91c1c',
                                    fontWeight: 600,
                                }}>
                                    {actionMessage.text}
                                </div>
                            )}
                            <div className="course-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {isEnrolledCoursesLoading ? (
                                    <div className="text-center py-5"><i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#004736' }}></i><p className="mt-3" style={{ color: '#666' }}>{t('loadingCourses')}</p></div>
                                ) : enrolledCoursesError ? (
                                    <div style={{ padding: '18px 20px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>{enrolledCoursesError}</div>
                                ) : enrolledCourses.length === 0 ? (
                                    <div className="text-center py-5"><i className="fas fa-book-open" style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }}></i><h5 style={{ color: '#666' }}>{t('noCoursesTitle')}</h5><p style={{ color: '#999' }}>{t('noCoursesDescription')}</p><Link href="/courses-grid" className="theme-btn mt-2">{t('browseCourses')}</Link></div>
                                ) : (
                                    enrolledCourses.map((course) => {
                                        const watchPercent = Number(course.watchPercent ?? 0);
                                        const completionPercent = Number(course.completionPercent ?? course.progressPercent ?? course.progress ?? 0);
                                        const isCompleted = course.status === 'completed';
                                        const isArchived = course.courseStatus === 'ARCHIVED';

                                        return (
                                            <div key={course.courseId || course.id} className="course-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
                                                <div className="course-card-icon" style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'linear-gradient(135deg, #004736 0%, #006B52 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <i className="fas fa-book-open" style={{ fontSize: '28px', color: '#fff' }}></i>
                                                </div>
                                                <div className="course-card-info" style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="course-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                        <h5 className="course-card-title text-resp-body-lg" style={{ margin: 0, color: '#333', fontWeight: '600' }}>{course.title || t('courseFallback')}</h5>
                                                        {isCompleted ? <span className="course-card-badge completed" style={{ background: '#dcfce7', color: '#22c55e', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}><i className="fas fa-check me-1"></i>{t('completed')}</span> : <span className="course-card-badge in-progress" style={{ background: '#fef3c7', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>{t('inProgress')}</span>}
                                                        {isArchived && <span className="course-card-badge archived" style={{ background: '#e2e8f0', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{t('archived')}</span>}
                                                    </div>
                                                    <p className="course-card-meta text-resp-body-lg" style={{ margin: '0 0 10px', color: '#666' }}>
                                                        <i className="fas fa-user me-2"></i>{course.authorName || course.instructor || '-'}
                                                        {isPharmacist && <><span style={{ margin: '0 10px', color: '#ddd' }}>|</span><i className="fas fa-certificate me-1"></i>{Number(course.cpeCredits || course.cpe || 0)} {t('credits')}</>}
                                                    </p>
                                                    <p className="text-resp-body" style={{ margin: '0 0 10px', color: '#64748b', fontSize: '13px' }}>{t('watch')}: {watchPercent}% • {t('completedLessons')}: {completionPercent}%</p>
                                                    <div className="course-card-progress" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${watchPercent}%`, height: '100%', background: isCompleted || watchPercent >= 100 ? '#22c55e' : '#004736', borderRadius: '4px' }}></div>
                                                        </div>
                                                        <span style={{ color: '#666', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>{watchPercent}%</span>
                                                    </div>
                                                </div>
                                                <div className="course-card-actions" style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                                    {isCompleted ? (
                                                        <DownloadButton downloadLabel={t('downloadCertificate')} downloadingLabel={t('downloadingCertificate')} />
                                                    ) : (
                                                        <>
                                                            <Link href={`/course-learning?courseId=${course.courseId || course.id}`} className="course-card-btn text-resp-btn" style={{ padding: '12px 24px', background: '#004736', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t('continue')}</Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setActionMessage(null);
                                                                    setCancelTarget(course);
                                                                    setCancelReason('');
                                                                }}
                                                                style={{
                                                                    padding: '12px 18px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #fecaca',
                                                                    background: '#fff',
                                                                    color: '#b91c1c',
                                                                    fontWeight: 700,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {t('cancelCourse')}
                                                            </button>
                                                        </>
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

                {shouldShowInactiveCoursesSection && (
                    <div className="row mt-4">
                        <div className="col-12">
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h4 className="text-resp-h3" style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>{t('inactiveCoursesTitle')}</h4>
                                        <p className="text-resp-body" style={{ margin: '6px 0 0', color: '#64748b' }}>{t('inactiveCoursesDescription')}</p>
                                    </div>
                                </div>
                                {isInactiveCoursesLoading ? (
                                    <div className="text-center py-4"><i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: '#94a3b8' }}></i></div>
                                ) : inactiveCoursesError ? (
                                    <div style={{ padding: '18px 20px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>{inactiveCoursesError}</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {inactiveCourses.map((course) => (
                                            <div key={`inactive-${course.courseId || course.id}`} style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px 20px', background: '#fafafa' }}>
                                                <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                                            <h5 className="text-resp-body-lg" style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>{course.title || t('courseFallback')}</h5>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '5px 10px',
                                                                borderRadius: '999px',
                                                                background: course.enrollmentStatus === 'REFUND_PENDING' ? '#ffedd5' : '#e2e8f0',
                                                                color: course.enrollmentStatus === 'REFUND_PENDING' ? '#c2410c' : '#475569',
                                                                fontSize: '12px',
                                                                fontWeight: 700,
                                                            }}>
                                                                {getInactiveStatusLabel(course)}
                                                            </span>
                                                        </div>
                                                        <p className="text-resp-body" style={{ margin: '0 0 8px', color: '#64748b' }}>
                                                            <i className="fas fa-user me-2"></i>{course.authorName || course.instructor || '-'}
                                                        </p>
                                                        {course.cancelledAt && (
                                                            <p className="text-resp-body" style={{ margin: '0 0 6px', color: '#64748b' }}>
                                                                {t('cancelledAt')}: {formatLocaleDate(course.cancelledAt, locale)}
                                                            </p>
                                                        )}
                                                        {course.refundRequest?.requestedAt && (
                                                            <p className="text-resp-body" style={{ margin: '0 0 6px', color: '#64748b' }}>
                                                                {t('refundRequestedAt')}: {formatLocaleDate(course.refundRequest.requestedAt, locale)}
                                                            </p>
                                                        )}
                                                        {course.cancelReason && (
                                                            <p className="text-resp-body" style={{ margin: 0, color: '#64748b' }}>
                                                                {t('cancelReason')}: {course.cancelReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Link href={`/courses/${course.courseId || course.id}`} className="theme-btn style-2" style={{ padding: '12px 18px', fontWeight: 'bold' }}>
                                                            {course.enrollmentStatus === 'CANCELLED' && Number(course.price ?? 0) <= 0 ? t('reEnroll') : t('openCourse')}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {cancelTarget && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 1100,
                }}>
                    <div style={{ width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)' }}>
                        <h4 className="text-resp-h3" style={{ margin: 0, color: '#111827', fontWeight: 700 }}>{t('cancelCourseTitle')}</h4>
                        <p className="text-resp-body" style={{ margin: '12px 0 18px', color: '#4b5563', lineHeight: 1.7 }}>
                            {Number(cancelTarget.price ?? 0) > 0 ? t('cancelCourseDescriptionPaid') : t('cancelCourseDescriptionFree')}
                        </p>
                        <div style={{ marginBottom: '16px', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#0f172a' }}>{cancelTarget.title || t('courseFallback')}</strong>
                        </div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 600 }}>{t('cancelReasonLabel')}</label>
                        <textarea
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                            placeholder={t('cancelReasonPlaceholder')}
                            rows={4}
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                border: '1px solid #cbd5e1',
                                padding: '14px 16px',
                                resize: 'vertical',
                                marginBottom: '20px',
                            }}
                        />
                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                onClick={closeCancelModal}
                                disabled={isCancelling}
                                style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600 }}
                            >
                                {t('keepCourse')}
                            </button>
                            <button
                                type="button"
                                onClick={() => void confirmCancelCourse()}
                                disabled={isCancelling}
                                style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid #b91c1c', background: '#b91c1c', color: '#fff', fontWeight: 700 }}
                            >
                                {isCancelling ? t('cancelInProgress') : Number(cancelTarget.price ?? 0) > 0 ? t('confirmCancelPaid') : t('confirmCancelFree')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default UserProfileArea;
