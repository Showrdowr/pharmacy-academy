"use client"
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';
import { formatLocaleCurrency, formatLocaleDate, useAppLocale } from '@/features/i18n';
import { usePaymentHistory } from '../hooks';

const PaymentHistoryArea = () => {
    const { locale } = useAppLocale();
    const t = useTranslations('payment.history');
    const { orders, isLoading } = usePaymentHistory();

    const payments = orders.map(o => ({
        id: o.orderNumber,
        course: o.items.map(i => i.title).join(', ') || t('untitledCourse'),
        date: formatLocaleDate(o.createdAt, locale, { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: o.total,
        status: o.status,
    }));

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCourses = orders.reduce((sum, o) => sum + o.items.length, 0);

    return (
        <section className="payment-history-section section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="history-wrapper" style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '40px',
                            boxShadow: '0 10px 40px rgba(0, 71, 54, 0.1)'
                        }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="text-resp-h3 text-force-bold" style={{ color: '#004736', marginBottom: '0' }}>{t('title')}</h3>
                            </div>

                            <div className="table-responsive">
                                <table className="table" style={{ marginBottom: '0' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa' }}>
                                            <th className="text-resp-body-lg text-force-bold" style={{ color: '#004736', padding: '15px' }}>{t('orderId')}</th>
                                            <th className="text-resp-body-lg text-force-bold" style={{ color: '#004736', padding: '15px' }}>{t('course')}</th>
                                            <th className="text-resp-body-lg text-force-bold" style={{ color: '#004736', padding: '15px' }}>{t('date')}</th>
                                            <th className="text-resp-body-lg text-force-bold" style={{ color: '#004736', padding: '15px' }}>{t('amount')}</th>
                                            <th className="text-resp-body-lg text-force-bold" style={{ color: '#004736', padding: '15px' }}>{t('status')}</th>
                                            <th className="text-resp-body-lg text-force-bold" style={{ color: '#004736', padding: '15px' }}>{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                <td className="text-resp-body-lg text-force-bold" style={{ padding: '15px', color: '#004736' }}>{payment.id}</td>
                                                <td className="text-resp-body-lg" style={{ padding: '15px', color: '#333' }}>{payment.course}</td>
                                                <td className="text-resp-body" style={{ padding: '15px', color: '#666' }}>{payment.date}</td>
                                                <td className="text-resp-body-lg text-force-bold" style={{ padding: '15px', color: '#004736' }}>{formatLocaleCurrency(payment.amount, locale)}</td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{
                                                        background: '#E8F8F4',
                                                        color: '#40C7A9',
                                                        padding: '6px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {t('success')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <Link href="#" className="text-resp-body" style={{ color: '#004736', fontWeight: '500' }}>
                                                        <i className="fas fa-download me-1"></i> {t('receipt')}
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card Layout */}
                            <div className="payment-cards-mobile">
                                {payments.map((payment, index) => (
                                    <div key={index} style={{
                                        marginBottom: '16px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                                    }}>
                                        {/* Card Header - Order ID */}
                                        <div style={{
                                            background: '#004736',
                                            color: '#fff',
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            {payment.id}
                                        </div>
                                        {/* Card Body */}
                                        <div style={{ padding: '16px', background: '#fff' }}>
                                            {/* Course Name */}
                                            <h6 style={{
                                                color: '#004736',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                marginBottom: '6px'
                                            }}>
                                                {payment.course}
                                            </h6>
                                            {/* Date */}
                                            <p style={{
                                                color: '#666',
                                                fontSize: '12px',
                                                marginBottom: '12px'
                                            }}>
                                                {payment.date}
                                            </p>
                                            {/* Amount & Status */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '14px'
                                            }}>
                                                <span style={{
                                                    color: '#004736',
                                                    fontSize: '20px',
                                                    fontWeight: '700'
                                                }}>
                                                    {formatLocaleCurrency(payment.amount, locale)}
                                                </span>
                                                <span style={{
                                                    background: '#E8F8F4',
                                                    color: '#40C7A9',
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {t('success')}
                                                </span>
                                            </div>
                                            {/* Receipt Button */}
                                            <Link href="#" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                padding: '12px',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '10px',
                                                color: '#004736',
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}>
                                                <i className="fas fa-download"></i> {t('receipt')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-box mt-4" style={{
                                background: '#E8F8F4',
                                borderRadius: '10px',
                                padding: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'nowrap',
                                    gap: '0'
                                }}>
                                    <div style={{ flex: 1, textAlign: 'center', padding: '15px', borderRight: '1px solid rgba(0, 71, 54, 0.1)' }}>
                                        <h5 className="text-resp-h3 text-force-bold" style={{ color: '#004736', marginBottom: '4px' }}>{formatLocaleCurrency(totalAmount, locale)}</h5>
                                        <p className="text-resp-body" style={{ color: '#666', marginBottom: '0' }}>{t('totalAmount')}</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center', padding: '15px', borderRight: '1px solid rgba(0, 71, 54, 0.1)' }}>
                                        <h5 className="text-resp-h3 text-force-bold" style={{ color: '#004736', marginBottom: '4px' }}>{totalCourses}</h5>
                                        <p className="text-resp-body" style={{ color: '#666', marginBottom: '0' }}>{t('coursesPurchased')}</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center', padding: '15px' }}>
                                        <h5 className="text-resp-h3 text-force-bold" style={{ color: '#004736', marginBottom: '4px' }}>{totalCourses}</h5>
                                        <p className="text-resp-body" style={{ color: '#666', marginBottom: '0' }}>{t('cpeCredits')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentHistoryArea;
