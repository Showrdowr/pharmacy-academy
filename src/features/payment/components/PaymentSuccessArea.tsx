"use client";

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { formatLocaleCurrency, formatLocaleDate, useAppLocale } from '@/features/i18n';
import { useOrderStore } from '@/stores/useOrderStore';

const PaymentSuccessArea = () => {
    const { locale } = useAppLocale();
    const t = useTranslations('payment.success');
    const { orderId, orderTotal, orderNumber, paymentMethod, clearCurrentOrder } = useOrderStore();

    // Clear order store after success page is shown
    useEffect(() => {
        return () => {
            clearCurrentOrder();
        };
    }, [clearCurrentOrder]);

    const transactionData = {
        amount: orderTotal || 0,
        transactionId: orderNumber || orderId || 'N/A',
        paymentMethod: paymentMethod === 'card' ? t('paymentMethodCard') : t('paymentMethodPromptPay'),
        date: formatLocaleDate(new Date(), locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        merchant: 'Pharmacy Academy',
        email: 'customer@example.com'
    };

    return (
        <section className="payment-result-section section-padding">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-8">
                        <div className="result-wrapper text-center" style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '48px 40px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
                        }}>
                            {/* Success Icon */}
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: '#22c55e',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <i className="fas fa-check" style={{ fontSize: '28px', color: '#fff' }}></i>
                            </div>

                            {/* Title */}
                            <h2 className="payment-status-title" style={{ color: '#22c55e' }}>
                                {t('title')}
                            </h2>

                            <p className="payment-status-message" style={{ color: '#666' }}>
                                {t('message')}
                            </p>

                            {/* Transaction Details */}
                            <div style={{
                                background: '#fff',
                                borderRadius: '12px',
                                padding: '24px',
                                marginBottom: '24px',
                                textAlign: 'left',
                                border: '1px solid #f0f0f0'
                            }}>
                                {/* Amount */}
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <span className="payment-detail-label">{t('amount')}</span>
                                    <span className="payment-detail-amount">
                                        {formatLocaleCurrency(transactionData.amount, locale)}
                                    </span>
                                </div>

                                {/* Transaction ID */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span style={{ color: '#666', fontSize: '16px' }}>{t('transactionId')}</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        background: '#f5f5f5',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {transactionData.transactionId}
                                    </span>
                                </div>

                                {/* Payment Method */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="payment-detail-label">{t('paymentMethod')}</span>
                                    <span className="payment-detail-value">
                                        {transactionData.paymentMethod}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="payment-detail-label">{t('date')}</span>
                                    <span className="payment-detail-value">
                                        {transactionData.date}
                                    </span>
                                </div>

                                {/* Merchant */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="payment-detail-label">{t('merchant')}</span>
                                    <span className="payment-detail-value" style={{ fontWeight: '500' }}>
                                        {transactionData.merchant}
                                    </span>
                                </div>
                            </div>

                            {/* Email Receipt */}
                            <div style={{
                                background: '#f0fdf4',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <i className="fas fa-envelope" style={{ color: '#22c55e' }}></i>
                                <span style={{ color: '#22c55e', fontSize: '15px' }}>
                                    {t('receiptSentTo')} {transactionData.email}
                                </span>
                            </div>

                            {/* Return Button */}
                            <Link
                                href="/courses-grid?tab=my"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '16px',
                                    background: '#014D40',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    marginBottom: '24px',
                                    transition: 'all 0.2s ease'
                                }}
                                className="payment-btn-main"
                            >
                                <i className="fas fa-book-open"></i>
                                {t('goToMyCourses')}
                            </Link>

                            {/* Help Text */}
                            <p style={{
                                color: '#999',
                                fontSize: '13px',
                                margin: 0
                            }}>
                                {t('needHelp')}{' '}
                                <a href="mailto:support@pharmacyacademy.com" style={{ color: '#22c55e' }}>
                                    support@pharmacyacademy.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentSuccessArea;
