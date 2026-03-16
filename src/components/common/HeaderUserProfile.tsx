"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useLanguage } from '@/features/i18n';

interface HeaderUserProfileProps {
    compact?: boolean;
}

const HeaderUserProfile = ({ compact = false }: HeaderUserProfileProps) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { language, t } = useLanguage();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated || !user) {
        // Mobile: Icon-only buttons

        // Desktop: Full buttons with text
        return (
            <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                {/* Login Button - Outlined Style */}
                <Link
                    href="/sign-in"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'transparent',
                        border: '2px solid #014D40',
                        borderRadius: '8px',
                        color: '#014D40',
                        fontWeight: '600',
                        fontSize: '16px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#014D40';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 77, 64, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#014D40';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>{t('เข้าสู่ระบบ', 'Sign In')}</span>
                </Link>

                {/* Register Button - Solid Style */}
                <Link
                    href="/register"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #014D40 0%, #006B5A 100%)',
                        border: '2px solid transparent',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '16px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(1, 77, 64, 0.2)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(1, 77, 64, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 77, 64, 0.2)';
                    }}
                >
                    <i className="fas fa-user-plus"></i>
                    <span>{t('ลงทะเบียน', 'Register')}</span>
                </Link>
            </div>
        );
    }

    // Mobile: Avatar-only compact version for logged-in users
    if (isMobile) {
        return (
            <div className="header-user-profile" ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #014D40 0%, #006B5A 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        padding: 0,
                    }}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                        <i className="fas fa-user" style={{ color: '#fff', fontSize: '14px' }}></i>
                    )}
                </button>

                {/* Dropdown Menu for Mobile */}
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '200px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    padding: '8px',
                    zIndex: 1000,
                    opacity: dropdownOpen ? 1 : 0,
                    visibility: dropdownOpen ? 'visible' : 'hidden',
                    transform: dropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
                    transition: 'all 0.25s ease',
                }}>
                    {/* User Info Header */}
                    <div style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', marginBottom: '8px' }}>
                        <p style={{ margin: 0, color: '#014D40', fontWeight: '600', fontSize: '16px' }}>{user.fullName}</p>
                        <p style={{ margin: '2px 0 0', color: '#666', fontSize: '13px' }}>{user.email}</p>
                    </div>

                    <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                        color: '#333', textDecoration: 'none', borderRadius: '8px',
                    }}>
                        <i className="fas fa-user-circle" style={{ color: '#0284c7' }}></i>
                        <span>{t('โปรไฟล์', 'Profile')}</span>
                    </Link>

                    <Link href="/payment-history" onClick={() => setDropdownOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                        color: '#333', textDecoration: 'none', borderRadius: '8px',
                    }}>
                        <i className="fas fa-receipt" style={{ color: '#d97706' }}></i>
                        <span>{t('ประวัติชำระเงิน', 'Payment History')}</span>
                    </Link>

                    <div style={{ height: '1px', background: '#f0f0f0', margin: '8px 0' }}></div>

                    <button onClick={() => { setDropdownOpen(false); logout(); }} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                        width: '100%', background: 'transparent', border: 'none',
                        color: '#ef4444', cursor: 'pointer', borderRadius: '8px',
                    }}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>{t('ออกจากระบบ', 'Sign Out')}</span>
                    </button>
                </div>
            </div>
        );
    }

    // Desktop: Full user profile
    return (
        <div className="header-user-profile" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px 8px 8px',
                    background: 'linear-gradient(135deg, #014D40 0%, #006B5A 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: dropdownOpen
                        ? '0 8px 24px rgba(1, 77, 64, 0.35)'
                        : '0 4px 12px rgba(1, 77, 64, 0.2)',
                    transform: dropdownOpen ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                    if (!dropdownOpen) {
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(1, 77, 64, 0.3)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!dropdownOpen) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 77, 64, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }
                }}
            >
                {/* Avatar */}
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}>
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <i className="fas fa-user" style={{ color: '#888', fontSize: '18px' }}></i>
                    )}
                </div>

                {/* User Info */}
                <div style={{ textAlign: 'left', minWidth: '120px' }}>
                    <p style={{
                        margin: 0,
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '16px',
                        lineHeight: '1.3',
                        letterSpacing: '0.01em',
                    }}>
                        {user.fullName}
                    </p>
                    <p style={{
                        margin: 0,
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: '14px',
                        lineHeight: '1.3',
                    }}>
                        {user.email}
                    </p>
                </div>

                {/* Dropdown Arrow */}
                <div style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <i
                        className="fas fa-chevron-down"
                        style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '11px',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                    ></i>
                </div>
            </button>

            {/* Dropdown Menu */}
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '220px',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.05)',
                padding: '8px',
                zIndex: 1000,
                opacity: dropdownOpen ? 1 : 0,
                visibility: dropdownOpen ? 'visible' : 'hidden',
                transform: dropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* User Info Header */}
                <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0',
                    marginBottom: '8px',
                }}>
                    <p style={{
                        margin: 0,
                        color: '#014D40',
                        fontWeight: '600',
                        fontSize: '14px',
                    }}>
                        {user.fullName}
                    </p>
                    <p style={{
                        margin: '2px 0 0',
                        color: '#666',
                        fontSize: '12px',
                    }}>
                        {user.role === 'pharmacist' ? t('👨‍⚕️ เภสัชกร', '👨‍⚕️ Pharmacist') : t('👤 ผู้ใช้ทั่วไป', '👤 User')}
                    </p>
                </div>

                <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        color: '#333',
                        textDecoration: 'none',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0fdf4';
                        e.currentTarget.style.color = '#014D40';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#333';
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <i className="fas fa-user-circle" style={{ color: '#0284c7', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ fontWeight: '500' }}>{t('โปรไฟล์', 'Profile')}</span>
                </Link>

                <Link
                    href="/payment-history"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        color: '#333',
                        textDecoration: 'none',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0fdf4';
                        e.currentTarget.style.color = '#014D40';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#333';
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <i className="fas fa-receipt" style={{ color: '#d97706', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ fontWeight: '500' }}>{t('ประวัติชำระเงิน', 'Payment History')}</span>
                </Link>

                <div style={{ height: '1px', background: '#f0f0f0', margin: '8px 0' }}></div>

                <button
                    onClick={() => {
                        setDropdownOpen(false);
                        logout();
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <i className="fas fa-sign-out-alt" style={{ color: '#ef4444', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ fontWeight: '500' }}>{t('ออกจากระบบ', 'Sign Out')}</span>
                </button>
            </div>
        </div>
    );
};

export default HeaderUserProfile;
