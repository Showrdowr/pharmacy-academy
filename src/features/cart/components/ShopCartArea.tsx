"use client";

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useAudienceFilteredCart } from '@/features/cart/hooks';
import { useAppLocale } from '@/features/i18n';
import { formatCoursePrice } from '@/features/courses/utils';

const FALLBACK_IMAGE = '/assets/img/courses/01.jpg';
const EXTERNAL_IMAGE_PATTERN = /^(https?:\/\/|data:|blob:)/i;
const BASE64_PATTERN = /^[A-Za-z0-9+/=\r\n]+$/;

function normalizeImageSrc(src?: string): string {
    if (!src) return FALLBACK_IMAGE;

    const normalized = src.trim();
    if (!normalized) return FALLBACK_IMAGE;
    if (EXTERNAL_IMAGE_PATTERN.test(normalized)) return normalized;
    if (normalized.startsWith('/')) return normalized;

    const sanitized = normalized.replace(/\s+/g, '');
    if (sanitized.length > 100 && BASE64_PATTERN.test(sanitized)) {
        return `data:image/jpeg;base64,${sanitized}`;
    }

    return `/${normalized}`;
}

const ShopCartArea = () => {
    const { locale } = useAppLocale();
    const t = useTranslations('courses.cart');
    const { cartItems, removeFromCart, clearCart, recentlyRemovedCount } = useAudienceFilteredCart();
    const payableItems = cartItems.filter((item) => Number(item.price) > 0);
    const subtotal = payableItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return (
        <>
            <div className="cart-section section-padding">
                <div className="container">
                    <div className="cart-list-area">
                        {recentlyRemovedCount > 0 && (
                            <div
                                style={{
                                    marginBottom: '20px',
                                    border: '1px solid #fdba74',
                                    background: '#fff7ed',
                                    color: '#9a3412',
                                    borderRadius: '14px',
                                    padding: '14px 16px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                }}
                            >
                                {t('restrictedItemsRemoved', { count: recentlyRemovedCount })}
                            </div>
                        )}
                        {payableItems.length === 0 ? (
                            <div
                                style={{
                                    background: '#fff',
                                    borderRadius: '16px',
                                    padding: '40px 24px',
                                    textAlign: 'center',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                                }}
                            >
                                <h4 style={{ marginBottom: '12px' }}>{t('emptyTitle')}</h4>
                                <p style={{ color: '#666', marginBottom: '20px' }}>
                                    {t('emptyDescription')}
                                </p>
                                <Link href="/courses-grid" className="theme-btn">
                                    {t('browseCourses')}
                                </Link>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table common-table">
                                    <thead data-aos="fade-down">
                                        <tr>
                                            <th className="text-center">{t('product')}</th>
                                            <th className="text-center">{t('price')}</th>
                                            <th className="text-center">{t('quantity')}</th>
                                            <th className="text-center">{t('subtotal')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payableItems.map((item) => {
                                            const imageSrc = normalizeImageSrc(item.image);

                                            return (
                                                <tr key={item.id} className="align-items-center py-3">
                                                    <td>
                                                        <div className="cart-item-thumb d-flex align-items-center gap-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(item.id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#dc2626',
                                                                    cursor: 'pointer',
                                                                }}
                                                                aria-label={t('removeCourse')}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                                                                {imageSrc.startsWith('data:') ? (
                                                                    <img
                                                                        className="w-100"
                                                                        src={imageSrc}
                                                                        alt={item.title}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    <Image
                                                                        src={imageSrc}
                                                                        alt={item.title}
                                                                        fill
                                                                        sizes="80px"
                                                                        style={{ objectFit: 'cover' }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className="head d-block">{item.title}</span>
                                                                <small style={{ color: '#666' }}>{item.instructor}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="price-usd">
                                                            {formatCoursePrice(item.price, locale)}
                                                        </span>
                                                    </td>
                                                    <td className="price-quantity text-center">
                                                        <span className="price-usd">1</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="price-usd">
                                                            {formatCoursePrice(item.price, locale)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="cart-total-area section-padding pt-0">
                <div className="container">
                    <div className="cart-total-items">
                        <h3>{t('cartTotals')}</h3>
                        <ul>
                            <li>
                                {t('subtotal')} <span className="subtotal">{formatCoursePrice(subtotal, locale)}</span>
                            </li>
                            <li>
                                {t('total')} <span className="price">{formatCoursePrice(subtotal, locale)}</span>
                            </li>
                        </ul>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Link href="/checkout" className="theme-btn" aria-disabled={payableItems.length === 0}>
                                {t('proceedToCheckout')}
                            </Link>
                            {payableItems.length > 0 && (
                                <button type="button" onClick={clearCart} className="theme-btn style-2">
                                    {t('clearCart')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShopCartArea;
