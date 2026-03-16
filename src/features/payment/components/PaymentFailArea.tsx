"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/features/i18n';

const PaymentFailArea = () => {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const paymentType = searchParams.get('type') || 'card'; // card, qr, promptpay
    const [showDetails, setShowDetails] = useState(false);

    // Error details based on payment type
    const getErrorInfo = () => {
        switch (paymentType) {
            case 'qr':
            case 'promptpay':
                return {
                    code: 'ERR_QR_TIMEOUT',
                    title: t('QR Code หมดอายุ', 'QR Code Expired'),
                    message: t('QR Code หมดเวลาชำระเงิน กรุณาสร้าง QR Code ใหม่', 'QR Code payment has expired. Please generate a new QR Code.'),
                    time: new Date().toLocaleString('th-TH'),
                    reference: 'PA-2024-QR-001234'
                };
            default:
                return {
                    code: 'ERR_CARD_DECLINED',
                    title: t('บัตรถูกปฏิเสธ', 'Card Declined'),
                    message: t('ธนาคารปฏิเสธการทำรายการ กรุณาตรวจสอบวงเงินหรือติดต่อธนาคารของท่าน', 'Your bank declined the transaction. Please check your available balance or contact your bank.'),
                    time: new Date().toLocaleString('th-TH'),
                    reference: 'PA-2024-001234'
                };
        }
    };

    const errorInfo = getErrorInfo();

    return (
        <section className="payment-fail-section section-padding" style={{
            background: 'linear-gradient(180deg, #fef2f2 0%, #fff 100%)',
            minHeight: '100vh'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-8">
                        {/* Main Card */}
                        <div className="fail-wrapper" style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: '0',
                            boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)',
                            overflow: 'hidden'
                        }}>
                            {/* Header with red gradient */}
                            <div style={{
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                padding: '40px 30px',
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                    opacity: 0.5
                                }}></div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    {/* Animated X Icon */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '80px',
                                        height: '80px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '50%',
                                        marginBottom: '16px',
                                        animation: 'pulse 2s infinite'
                                    }}>
                                        <i className="fas fa-times" style={{ fontSize: '40px', color: '#fff' }}></i>
                                    </div>
                                    <h2 className="payment-status-title" style={{ color: '#fff', marginBottom: '8px' }}>
                                        {t('การชำระเงินไม่สำเร็จ', 'Payment Failed')}
                                    </h2>
                                    <p className="payment-status-message" style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                        {t('กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง', 'Please check your details and try again')}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '30px' }}>
                                {/* Error Message Box */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    marginBottom: '24px',
                                    border: '1px solid #fecaca'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{
                                            background: '#dc2626',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <i className="fas fa-exclamation" style={{ color: '#fff', fontSize: '14px' }}></i>
                                        </div>
                                        <div>
                                            <h5 style={{ color: '#991b1b', marginBottom: '4px', fontWeight: 'bold' }}>
                                                {errorInfo.title}
                                            </h5>
                                            <p className="payment-status-message" style={{ color: '#b91c1c', margin: 0 }}>
                                                {errorInfo.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Possible Reasons */}
                                <div style={{
                                    background: '#f9fafb',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    marginBottom: '24px'
                                }}>
                                    <h5 style={{ color: '#374151', marginBottom: '16px', fontWeight: '600' }}>
                                        <i className="fas fa-info-circle me-2" style={{ color: '#6b7280' }}></i>
                                        {t('สาเหตุที่เป็นไปได้', 'Possible Reasons')}
                                    </h5>
                                    <ul className="payment-detail-value" style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', lineHeight: '2' }}>
                                        {paymentType === 'card' ? (
                                            <>
                                                <li>{t('วงเงินในบัตรไม่เพียงพอ', 'Insufficient credit limit')}</li>
                                                <li>{t('ข้อมูลบัตรไม่ถูกต้อง', 'Incorrect card details')}</li>
                                                <li>{t('บัตรหมดอายุ', 'Expired card')}</li>
                                                <li>{t('ธนาคารบล็อกธุรกรรมออนไลน์', 'Online transactions blocked by bank')}</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>{t('QR Code หมดเวลา', 'QR Code has expired')}</li>
                                                <li>{t('ไม่ได้สแกนภายในเวลาที่กำหนด', 'Did not scan within the time limit')}</li>
                                                <li>{t('การเชื่อมต่อมีปัญหา', 'Connection issues')}</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                {/* Error Details (Collapsible) */}
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    style={{
                                        width: '100%',
                                        background: 'none',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '14px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: showDetails ? '0' : '24px',
                                        borderBottomLeftRadius: showDetails ? 0 : '12px',
                                        borderBottomRightRadius: showDetails ? 0 : '12px'
                                    }}
                                >
                                    <span style={{ color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>
                                        <i className="fas fa-file-alt me-2"></i>
                                        {t('รายละเอียดข้อผิดพลาด', 'Error Details')}
                                    </span>
                                    <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`} style={{ color: '#9ca3af', fontSize: '12px' }}></i>
                                </button>

                                {showDetails && (
                                    <div style={{
                                        background: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderTop: 'none',
                                        borderRadius: '0 0 12px 12px',
                                        padding: '16px',
                                        marginBottom: '24px',
                                        fontSize: '13px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#6b7280' }}>{t('รหัสข้อผิดพลาด', 'Error Code')}:</span>
                                            <code style={{ color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                                                {errorInfo.code}
                                            </code>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#6b7280' }}>{t('เวลา', 'Time')}:</span>
                                            <span style={{ color: '#374151' }}>{errorInfo.time}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#6b7280' }}>{t('หมายเลขอ้างอิง', 'Reference')}:</span>
                                            <span style={{ color: '#374151' }}>{errorInfo.reference}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link
                                        href="/checkout"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            padding: '16px',
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #004736 0%, #006B4F 100%)',
                                            color: '#fff',
                                            textDecoration: 'none',
                                            boxShadow: '0 4px 20px rgba(0, 71, 54, 0.3)'
                                        }}
                                        className="payment-btn-main"
                                    >
                                        <i className="fas fa-redo-alt"></i>
                                        {t('ลองชำระเงินใหม่', 'Try Payment Again')}
                                    </Link>

                                    {/* Alternative payment option based on type */}
                                    {paymentType === 'card' ? (
                                        <Link
                                            href="/payment-qr"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px',
                                                padding: '16px',
                                                borderRadius: '14px',
                                                background: '#fff',
                                                color: '#004736',
                                                textDecoration: 'none',
                                                border: '2px solid #004736'
                                            }}
                                            className="payment-btn-main"
                                        >
                                            <i className="fas fa-qrcode"></i>
                                            {t('ชำระผ่าน QR Code แทน', 'Pay via QR Code Instead')}
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/payment-card"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px',
                                                padding: '16px',
                                                borderRadius: '14px',
                                                background: '#fff',
                                                color: '#004736',
                                                textDecoration: 'none',
                                                border: '2px solid #004736'
                                            }}
                                            className="payment-btn-main"
                                        >
                                            <i className="fas fa-credit-card"></i>
                                            {t('ชำระผ่านบัตรเครดิต/เดบิตแทน', 'Pay via Credit/Debit Card Instead')}
                                        </Link>
                                    )}
                                </div>

                                {/* Back Link */}
                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '24px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid #e5e7eb'
                                }}>
                                    <Link
                                        href="/courses-grid"
                                        style={{
                                            color: '#6b7280',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                        {t('กลับไปเลือกคอร์สเรียน', 'Back to Courses')}
                                    </Link>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
            `}</style>
        </section>
    );
};

export default PaymentFailArea;
