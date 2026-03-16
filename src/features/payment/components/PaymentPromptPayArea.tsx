"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/features/i18n';

const PaymentPromptPayArea = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(1 * 60); // 1 minutes in seconds
    const orderTotal = 8990;
    const orderId = 'ORD-2025-8842';

    useEffect(() => {
        if (timeLeft <= 0) {
            // Redirect to payment fail page when timeout
            router.push('/payment-fail?type=promptpay');
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
        <div className="payment-section section-padding" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            <div className="container">
                {/* Progress Steps */}
                <div className="checkout-steps mb-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0',
                            }}>
                                {/* Step 1 */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#004736',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                    }}>✓</div>
                                    <span style={{ marginLeft: '10px', fontWeight: '500', color: '#004736' }}>{t('รายละเอียด', 'Details')}</span>
                                </div>

                                {/* Line */}
                                <div style={{ width: '80px', height: '2px', background: '#004736', margin: '0 20px' }}></div>

                                {/* Step 2 */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#004736',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                    }}>2</div>
                                    <span style={{ marginLeft: '10px', fontWeight: '500', color: '#004736' }}>{t('ชำระเงิน', 'Payment')}</span>
                                </div>

                                {/* Line */}
                                <div style={{ width: '80px', height: '2px', background: '#ddd', margin: '0 20px' }}></div>

                                {/* Step 3 */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#ddd',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                    }}>3</div>
                                    <span style={{ marginLeft: '10px', fontWeight: '500', color: '#666' }}>{t('ยืนยัน', 'Confirm')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mb-4">
                    <Link href="/shop-cart" style={{ color: '#666', textDecoration: 'none', fontSize: '18px' }}>
                        <i className="fas fa-arrow-left me-2"></i>
                        {t('กลับไปเลือกวิธีชำระเงิน', 'Go back and select a payment method.')}
                    </Link>
                </div>

                {/* QR Payment Card */}
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-7">
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        }}>
                            {/* Header */}
                            <div style={{
                                background: '#004736',
                                padding: '20px 25px',
                                textAlign: 'center',
                                color: '#fff',
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    background: '#fff',
                                    padding: '5px 15px',
                                    borderRadius: '5px',
                                    marginBottom: '12px',
                                }}>
                                    <img src="/assets/img/prompt-pay-logo.png" alt="PromptPay" style={{ height: '28px' }} />
                                </div>
                                <h5 style={{ margin: '0 0 5px', fontWeight: '600', fontSize: '18px', color: '#fff' }}>{t('สแกนเพื่อชำระเงิน', 'Scan to pay.')}</h5>
                                <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>{t('กรุณาสแกนภายในเวลาที่กำหนด', 'Please scan within the specified time.')}</p>
                            </div>

                            {/* QR Code Section */}
                            <div style={{ padding: '25px', textAlign: 'center' }}>
                                {/* QR Code */}
                                <div style={{
                                    display: 'inline-block',
                                    padding: '15px',
                                    background: '#fff',
                                    border: '1px solid #eee',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                }}>
                                    {/* Placeholder QR - in real app, use a QR library */}
                                    <div style={{
                                        width: '240px',
                                        height: '240px',
                                        background: `url('https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=promptpay-${orderId}')`,
                                        backgroundSize: 'cover',
                                    }}></div>
                                </div>

                                {/* Timer - moved below QR */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '12px 30px',
                                        background: 'linear-gradient(135deg, #ff8a80 0%, #ff6b6b 100%)',
                                        color: '#fff',
                                        borderRadius: '30px',
                                        fontWeight: '600',
                                        fontSize: '20px',
                                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                                    }}>
                                        <i className="far fa-clock"></i>
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>

                                {/* Amount */}
                                <h2 style={{ margin: '0 0 5px', color: '#333', fontWeight: 'bold', fontSize: '28px' }}>
                                    ฿{orderTotal.toLocaleString()}.00
                                </h2>
                                <p style={{ margin: '0 0 20px', color: '#666', fontSize: '13px' }}>
                                    Ref No: <strong>{orderId}</strong>
                                </p>

                                {/* Steps */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '20px',
                                    marginBottom: '20px',
                                }}>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: '#f0fdf4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 8px',
                                        }}>
                                            <i className="fas fa-mobile-alt" style={{ color: '#004736', fontSize: '14px' }}></i>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{t('1. เปิดแอปธนาคาร', '1. Open your banking app.')}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: '#f0fdf4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 8px',
                                        }}>
                                            <i className="fas fa-qrcode" style={{ color: '#004736', fontSize: '14px' }}></i>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{t('2. สแกน QR Code', '2. Scan the QR code.')}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: '#f0fdf4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 8px',
                                        }}>
                                            <i className="fas fa-check" style={{ color: '#004736', fontSize: '14px' }}></i>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{t('3. ระบบยืนยันอัตโนมัติ', '3. Automatic confirmation system.')}</p>
                                    </div>
                                </div>

                                {/* Save QR Button */}
                                <button style={{
                                    background: '#004736',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px 35px',
                                    borderRadius: '25px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}>
                                    <i className="fas fa-download me-2"></i>
                                    {t('บันทึก QR Code', 'Save QR code')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPromptPayArea;
