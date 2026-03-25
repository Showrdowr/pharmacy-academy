"use client"

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import NavMenu from './NavMenu';
import useSticky from "@/hooks/useStickyHook";
import OffCanvas from '@/components/common/OffCanvas';
import HeaderUserProfile from '@/components/common/HeaderUserProfile';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useSearch } from '@/features/search';
import { ALL_COURSES } from '@/features/search/SearchProvider';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { filterVisibleCoursesForViewer, getCourseViewerRole } from '@/features/courses/audience';
import { useTranslations } from 'next-intl';
import { formatLocaleCurrency, getLocalizedContent, useAppLocale } from '@/features/i18n';

const HeaderTwo = () => {
    const { sticky } = useSticky();
    const [openCanvas, setOpenCanvas] = useState(false);
    const { setSearchQuery } = useSearch();
    const { cartItems } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { locale } = useAppLocale();
    const t = useTranslations('navigation.header');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);
    const viewerRole = getCourseViewerRole(user, isAuthenticated);
    const visibleCourses = filterVisibleCoursesForViewer(ALL_COURSES, viewerRole);

    // Filter courses based on search
    const normalizedQuery = localSearch.trim().toLowerCase();
    const filteredCourses = visibleCourses.filter((course) => {
        const searchableText = [
            course.title,
            course.titleEn,
            course.category,
            course.categoryEn,
            course.instructor,
        ].join(' ').toLowerCase();

        return searchableText.includes(normalizedQuery);
    }).slice(0, 4);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(localSearch);
        setShowSuggestions(false);
        window.location.href = `/courses-grid?search=${encodeURIComponent(localSearch)}`;
    };

    return (
        <>
            <header className="header-section-2">
                <div id="header-sticky" className={`header-2 ${sticky ? "sticky" : ""}`}>
                    <div className="container">
                        <div className="mega-menu-wrapper">
                            <div className="header-main" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px'
                            }}>
                                {/* Logo - Always visible */}
                                <Link
                                    href="/"
                                    className="header-logo"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src="/images/Logo.jpg"
                                        alt={t('logoAlt')}
                                        className="header-logo-img"
                                        style={{
                                            height: sticky ? '45px' : '65px',
                                            width: 'auto',
                                            marginRight: '12px',
                                            transition: 'height 0.2s ease'
                                        }}
                                    />
                                    <span
                                        className="header-logo-text"
                                        style={{
                                            fontSize: sticky ? '20px' : '24px',
                                            fontWeight: 'bold',
                                            color: '#004736',
                                            whiteSpace: 'nowrap',
                                            transition: 'font-size 0.2s ease'
                                        }}>
                                        Pharmacy Academy
                                    </span>
                                </Link>

                                {/* Navigation Menu */}
                                <div className="header-left d-none d-xxl-flex" style={{ flex: '0 0 auto' }}>
                                    <div className="mean__menu-wrapper">
                                        <div className="main-menu">
                                            <nav id="mobile-menu">
                                                <NavMenu />
                                            </nav>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="header-right" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    flex: '1 1 auto',
                                    justifyContent: 'flex-end'
                                }}>
                                    {/* Search Box */}
                                    <div
                                        ref={searchRef}
                                        className="d-none d-lg-block"
                                        style={{
                                            position: 'relative',
                                            flex: sticky ? '0 1 200px' : '0 1 260px',
                                        }}
                                    >
                                        <form onSubmit={handleSearchSubmit}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                background: '#f5f7fa',
                                                borderRadius: '8px',
                                                padding: '8px 14px',
                                                border: showSuggestions ? '2px solid #004736' : '2px solid transparent',
                                                transition: 'all 0.2s ease',
                                            }}>
                                                <i className="fas fa-search" style={{ color: '#999', marginRight: '8px', fontSize: '18px' }}></i>
                                                <input
                                                    type="text"
                                                    placeholder={t('searchPlaceholder')}
                                                    value={localSearch}
                                                    onChange={(e) => {
                                                        setLocalSearch(e.target.value);
                                                        setShowSuggestions(e.target.value.length > 0);
                                                    }}
                                                    onFocus={() => localSearch.length > 0 && setShowSuggestions(true)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        outline: 'none',
                                                        width: '100%',
                                                        fontSize: '18px',
                                                        color: '#333',
                                                    }}
                                                />
                                            </div>
                                        </form>

                                        {/* Search Suggestions */}
                                        {showSuggestions && localSearch.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 8px)',
                                                left: 0,
                                                right: 0,
                                                background: '#fff',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                                                zIndex: 1000,
                                                overflow: 'hidden',
                                            }}>
                                                {filteredCourses.length === 0 ? (
                                                    <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                                        {t('noCoursesFound')}
                                                    </div>
                                                ) : (
                                                    filteredCourses.map((course) => {
                                                        const courseTitle = getLocalizedContent(locale, course.title, course.titleEn);

                                                        return (
                                                            <Link
                                                            key={course.id}
                                                            href={`/courses/${course.id}`}
                                                            onClick={() => setShowSuggestions(false)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                padding: '10px 14px',
                                                                textDecoration: 'none',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                transition: 'background 0.15s',
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>
                                                                    {courseTitle}
                                                                </div>
                                                                <div style={{ fontSize: '16px', color: '#666' }}>
                                                                    {formatLocaleCurrency(course.price, locale)}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Language Switcher */}
                                    <LanguageSwitcher />

                                    {/* Cart Icon - Hidden on mobile/tablet, visible on desktop only */}
                                    <Link
                                        href="/shop-cart"
                                        className="d-none d-xxl-flex"
                                        style={{
                                            position: 'relative',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '8px 16px',
                                            minHeight: '38px',
                                            background: 'transparent',
                                            border: '2px solid #014D40',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            transition: 'all 0.3s ease',
                                            flexShrink: 0,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#014D40';
                                            const icon = e.currentTarget.querySelector('i');
                                            if (icon) (icon as HTMLElement).style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            const icon = e.currentTarget.querySelector('i');
                                            if (icon) (icon as HTMLElement).style.color = '#014D40';
                                        }}
                                    >
                                        <i className="fas fa-shopping-cart" style={{ color: '#014D40', fontSize: '18px' }}></i>
                                        {cartItems.length > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '-6px',
                                                right: '-6px',
                                                minWidth: '18px',
                                                height: '18px',
                                                background: '#ef4444',
                                                color: '#fff',
                                                borderRadius: '50%',
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Profile - Hidden on mobile/tablet, visible on desktop only */}
                                    <div className="d-none d-xxl-block">
                                        <HeaderUserProfile compact={sticky} />
                                    </div>

                                    {/* Mobile Menu Toggle */}
                                    <div className="header__hamburger d-xxl-none my-auto">
                                        <div className="sidebar__toggle" onClick={() => setOpenCanvas(!openCanvas)}>
                                            <i className="fas fa-bars"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header >
            <OffCanvas openCanvas={openCanvas} setOpenCanvas={setOpenCanvas} />
        </>
    );
};

export default HeaderTwo;
