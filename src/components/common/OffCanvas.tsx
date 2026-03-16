"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useLanguage } from '@/features/i18n';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';

interface MenuItem {
    label: string;
    href?: string;
    submenu?: { label: string; href: string }[];
}

const OffCanvas = ({ setOpenCanvas, openCanvas }: any) => {
    const { t } = useLanguage();
    const { user, isAuthenticated, logout } = useAuth();
    const { cartItems } = useCart();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    // Hide body scrollbar when offcanvas is open
    React.useEffect(() => {
        if (openCanvas) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [openCanvas]);

    const menuItems: MenuItem[] = [
        { label: t('หน้าแรก', 'Home'), href: '/' },
        { label: t('คอร์สเรียน', 'Courses'), href: '/courses-grid' },
        { label: t('ตะกร้าสินค้า', 'Cart'), href: '/shop-cart' },
        { label: t('เกี่ยวกับเรา', 'About Us'), href: '/about_us' },
    ];

    const handleLogout = () => {
        setOpenCanvas(false);
        logout();
    };

    // Close dropdown when clicking outside
    const handleContainerClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Only close if not clicking on the profile button or dropdown
        if (!target.closest('[data-profile-dropdown]')) {
            setOpenSubmenu(null);
        }
    };

    return (
        <>
            {/* Full Screen Mobile Menu */}
            <div
                className="offcanvas-menu"
                onClick={handleContainerClick}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#fff',
                    zIndex: 9999,
                    display: openCanvas ? 'flex' : 'none',
                    flexDirection: 'column',
                    padding: '16px',
                    overflow: 'hidden',
                }}
            >
                {/* Header - Logo, Profile Icon and Close Button */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #eee',
                }}>
                    <Link href="/" onClick={() => setOpenCanvas(false)} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textDecoration: 'none',
                    }}>
                        <img src="/images/Logo.jpg" alt="Pharmacy Academy" style={{ height: '45px', width: 'auto' }} />
                        <span style={{ fontWeight: 'bold', color: '#014D40', fontSize: '18px' }}>
                            Pharmacy Academy
                        </span>
                    </Link>

                    {/* Right side - Profile Icon and Close Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* User Profile Icon with Dropdown */}
                        {isAuthenticated && user && (
                            <div style={{ position: 'relative' }} data-profile-dropdown>
                                <button
                                    onClick={() => setOpenSubmenu(openSubmenu === 'header-profile' ? null : 'header-profile')}
                                    style={{
                                        background: openSubmenu === 'header-profile' ? '#f0f0f0' : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: '#014D40',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <i className="fas fa-user" style={{ color: '#fff', fontSize: '12px' }}></i>
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                {openSubmenu === 'header-profile' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        marginTop: '8px',
                                        background: '#fff',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        minWidth: '180px',
                                        zIndex: 100,
                                        overflow: 'hidden',
                                    }}>
                                        <Link
                                            href="/profile"
                                            onClick={() => setOpenCanvas(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '14px 16px',
                                                fontSize: '15px',
                                                color: '#333',
                                                textDecoration: 'none',
                                                borderBottom: '1px solid #f0f0f0',
                                            }}
                                        >
                                            <i className="fas fa-user-circle" style={{ color: '#014D40' }}></i>
                                            {t('โปรไฟล์', 'Profile')}
                                        </Link>
                                        <Link
                                            href="/payment-history"
                                            onClick={() => setOpenCanvas(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '14px 16px',
                                                fontSize: '15px',
                                                color: '#333',
                                                textDecoration: 'none',
                                                borderBottom: '1px solid #f0f0f0',
                                            }}
                                        >
                                            <i className="fas fa-receipt" style={{ color: '#d97706' }}></i>
                                            {t('ประวัติชำระเงิน', 'Payment History')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '14px 16px',
                                                fontSize: '15px',
                                                color: '#dc2626',
                                                background: 'none',
                                                border: 'none',
                                                width: '100%',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <i className="fas fa-sign-out-alt"></i>
                                            {t('ออกจากระบบ', 'Logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* X icon to close */}
                        <button
                            onClick={() => setOpenCanvas(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                fontSize: '24px',
                                color: '#333',
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <nav style={{ flex: 1, paddingTop: '16px' }}>
                    {menuItems.map((item, index) => (
                        <div key={index} style={{ marginBottom: '2px' }}>
                            {item.submenu ? (
                                // Menu with submenu
                                <>
                                    <button
                                        onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            background: 'none',
                                            border: 'none',
                                            padding: '14px 12px',
                                            minHeight: '48px',
                                            fontSize: '17px',
                                            fontWeight: '500',
                                            color: '#333',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        {item.label}
                                        <i
                                            className={`fas fa-chevron-down`}
                                            style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                transition: 'transform 0.2s',
                                                transform: openSubmenu === item.label ? 'rotate(180deg)' : 'rotate(0)',
                                            }}
                                        ></i>
                                    </button>
                                    {openSubmenu === item.label && (
                                        <div style={{ paddingLeft: '20px', paddingTop: '10px' }}>
                                            {item.submenu.map((sub, subIndex) => (
                                                <Link
                                                    key={subIndex}
                                                    href={sub.href}
                                                    onClick={() => setOpenCanvas(false)}
                                                    style={{
                                                        display: 'block',
                                                        padding: '12px 0',
                                                        fontSize: '16px',
                                                        color: '#666',
                                                        textDecoration: 'none',
                                                        borderBottom: '1px solid #f5f5f5',
                                                    }}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href || '/'}
                                    onClick={() => setOpenCanvas(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 12px',
                                        minHeight: '48px',
                                        fontSize: '17px',
                                        fontWeight: '500',
                                        color: '#333',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <span>
                                        {item.label}
                                    </span>
                                    {/* Cart count - always show on right */}
                                    {item.href === '/shop-cart' && (
                                        <span style={{
                                            minWidth: '24px',
                                            height: '24px',
                                            background: cartItems.length > 0 ? '#ef4444' : '#e5e7eb',
                                            color: cartItems.length > 0 ? '#fff' : '#666',
                                            borderRadius: '50%',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Bottom Section - Login/Register for guest */}
                {!isAuthenticated && (
                    <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '2px solid #eee',
                        background: '#f9fafb',
                        margin: '16px -16px -16px -16px',
                        padding: '16px',
                    }}>
                        {/* Sign In */}
                        <Link
                            href="/sign-in"
                            onClick={() => setOpenCanvas(false)}
                            style={{
                                display: 'block',
                                padding: '16px 0',
                                fontSize: '18px',
                                fontWeight: '500',
                                color: '#333',
                                textDecoration: 'none',
                                borderBottom: '1px solid #f5f5f5',
                            }}
                        >
                            {t('เข้าสู่ระบบ', 'Sign In')}
                        </Link>

                        {/* Register */}
                        <Link
                            href="/register"
                            onClick={() => setOpenCanvas(false)}
                            style={{
                                display: 'block',
                                padding: '16px 0',
                                fontSize: '18px',
                                fontWeight: '500',
                                color: '#014D40',
                                textDecoration: 'none',
                            }}
                        >
                            {t('ลงทะเบียน', 'Register')}
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default OffCanvas;