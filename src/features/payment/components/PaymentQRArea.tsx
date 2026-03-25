"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { formatLocaleCurrency, useAppLocale } from '@/features/i18n';
import { useOrderStore } from '@/stores/useOrderStore';

const PaymentQRArea = () => {
    const t = useTranslations('payment.qr');
    const { locale } = useAppLocale();
    const router = useRouter();
    const { orderId: storeOrderId, orderTotal: storeTotal, reference } = useOrderStore();
    const [timeLeft, setTimeLeft] = useState(1 * 60); // 1 minute
    const orderTotal = storeTotal || 0;
    const orderId = reference || storeOrderId || '';
    const zeroAmountLabel = locale === 'en' ? 'THB 0' : '฿0';

    useEffect(() => {
        if (!storeOrderId) {
            router.replace('/checkout');
        }
    }, [storeOrderId, router]);

    const handleCancel = () => {
        if (confirm(t('cancelOrderConfirm'))) {
            router.push('/checkout');
        }
    };

    useEffect(() => {
        if (timeLeft <= 0) {
            // Redirect to payment fail page when timeout
            router.push('/payment-fail?type=qr');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, router]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="payment-section section-padding" style={{
            background: '#f5f5f5',
            minHeight: '100vh',
            paddingTop: '40px',
            paddingBottom: '40px'
        }}>
            <div className="container">
                {/* Main Content Row */}
                <div className="row">
                    {/* Left Column - Payment QR */}
                    <div className="col-lg-6 col-md-6 mb-4">
                        {/* Header */}
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '10px', color: '#014D40' }}>
                                {t('title')}
                            </h4>
                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                                {t('securityNotice')}
                            </p>
                        </div>

                        {/* Payment Card */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                        }}>
                            {/* Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #004736 0%, #006B4F 100%)',
                                padding: '20px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                            }}>
                                <h3 style={{
                                    color: '#fff',
                                    margin: '0 0 5px',
                                    fontSize: '24px',
                                    fontWeight: 'bold'
                                }}>
                                    {t('merchantName')}
                                </h3>
                                <p style={{
                                    color: '#fff',
                                    margin: 0,
                                    fontSize: '13px',
                                    opacity: 0.9
                                }}>
                                    powered by KBank
                                </p>
                            </div>

                            {/* Timer */}
                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#e8f5f1',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                }}>
                                    <i className="far fa-clock" style={{ color: '#014D40', fontSize: '18px' }}></i>
                                    <span style={{ color: '#014D40', fontSize: '20px', fontWeight: '600' }}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div style={{
                                display: 'inline-block',
                                padding: '20px',
                                background: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                marginBottom: '25px',
                            }}>
                                <div style={{
                                    width: '280px',
                                    height: '280px',
                                    background: `url('https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=00020101021129370016A000000677010111011300668812345678520400005303764540536435802TH5914EVENTTHAI+CO+LTD6007BANGKOK62160812${orderId}6304')`,
                                    backgroundSize: 'cover',
                                }}></div>
                            </div>

                            {/* Company Info */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '20px',
                                borderTop: '1px solid #eee',
                            }}>
                                <div style={{ textAlign: 'left' }}>
                                    <h5 style={{
                                        margin: '0 0 5px',
                                        fontWeight: '600',
                                        fontSize: '16px'
                                    }}>
                                        EVENTTHAI CO.,LTD
                                    </h5>
                                    <p style={{
                                        margin: 0,
                                        color: '#666',
                                        fontSize: '13px'
                                    }}>
                                        {t('refNumber')}: <strong>{orderId}</strong>
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h4 style={{
                                        margin: '0',
                                        fontWeight: 'bold',
                                        fontSize: '24px'
                                    }}>
                                        {formatLocaleCurrency(orderTotal, locale)}
                                    </h4>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <p style={{
                                marginTop: '20px',
                                fontSize: '12px',
                                color: '#666',
                                lineHeight: '1.5',
                            }}>
                                {t('paymentInProgress')}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="col-lg-6 col-md-6">
                        {/* Order Summary Card */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '25px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            marginBottom: '20px',
                        }}>
                            <h5 style={{ fontWeight: '600', marginBottom: '15px' }}>
                                {t('orderDetails')}
                            </h5>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                {t('orderSubtitle')}
                            </p>

                            {/* Column Headers */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                            }}>
                                <span style={{ color: '#999', fontSize: '13px' }}>
                                    {t('itemLabel')}
                                </span>
                                <span style={{ color: '#999', fontSize: '13px' }}>
                                    {t('amountLabel')}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                                paddingBottom: '15px',
                                borderBottom: '2px solid #014D40',
                            }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px' }}>
                                        {t('courseOrder')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                                        {formatLocaleCurrency(orderTotal, locale)}
                                    </p>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}>
                                    <span style={{ fontSize: '14px' }}>
                                        {t('subtotal')}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        {formatLocaleCurrency(orderTotal, locale)}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}>
                                    <span style={{ fontSize: '14px' }}>
                                        {t('serviceFee')}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        {zeroAmountLabel}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '15px',
                                    paddingBottom: '15px',
                                    borderBottom: '2px solid #014D40',
                                }}>
                                    <span style={{ fontSize: '14px' }}>
                                        {t('transactionFee')}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        {zeroAmountLabel}
                                    </span>
                                </div>

                                {/* Total */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                        {t('total')}
                                    </span>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {formatLocaleCurrency(orderTotal, locale)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes Card */}
                        <div style={{
                            background: '#e8f5f1',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px',
                        }}>
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <i className="fas fa-info-circle" style={{ color: '#014D40' }}></i>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                        {t('important')}
                                    </span>
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    fontSize: '13px',
                                    color: '#666'
                                }}>
                                    <li style={{ marginBottom: '5px' }}>
                                        {t('importantVat')}
                                    </li>
                                    <li>
                                        {t('importantKeepPage')}
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <i className="fas fa-info-circle" style={{ color: '#1976d2' }}></i>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                        {t('noteTitle')}
                                    </span>
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    fontSize: '13px',
                                    color: '#666'
                                }}>
                                    <li style={{ marginBottom: '5px' }}>
                                        {t('noteLine1')}
                                    </li>
                                    <li style={{ marginBottom: '5px' }}>
                                        {t('noteLine2')}
                                    </li>
                                    <li>
                                        {t('noteLine3')}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={handleCancel}
                            style={{
                                width: '100%',
                                background: '#fff',
                                color: '#014D40',
                                border: '2px solid #014D40',
                                padding: '12px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}>
                            <i className="fas fa-trash-alt"></i>
                            {t('cancelOrder')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentQRArea;
