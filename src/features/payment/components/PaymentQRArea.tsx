"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/features/i18n';

const PaymentQRArea = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(1 * 60); // 5 minutes
    const orderTotal = 364.35;
    const orderId = 'REF212560350598';

    const handleCancel = () => {
        if (confirm(t('คุณต้องการยกเลิกคำสั่งซื้อหรือไม่?', 'Are you sure you want to cancel this order?'))) {
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
                                {t('ชำระโดย คิวอาร์โค้ด', 'Pay by QR Code')}
                            </h4>
                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                                {t('ข้อมูลการชำระเงินของคุณได้รับการรักษาความปลอดภัยและไม่แบ่งปันกับบุคคลที่สาม',
                                    'Your payment information is secured and not shared with third parties.')}
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
                                    Pharmacy Academy
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
                                        Ref Number: <strong>{orderId}</strong>
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h4 style={{
                                        margin: '0',
                                        fontWeight: 'bold',
                                        fontSize: '24px'
                                    }}>
                                        {orderTotal.toFixed(2)}
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: '#666',
                                        fontSize: '13px'
                                    }}>
                                        บาท(BATH)
                                    </p>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <p style={{
                                marginTop: '20px',
                                fontSize: '12px',
                                color: '#666',
                                lineHeight: '1.5',
                            }}>
                                {t('อยู่ระหว่างการชำระเงิน กรุณาอย่าปิดหรือรีเฟรชเพจหน้าจอ',
                                    'Payment in progress. Please do not close or refresh this page.')}
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
                                {t('รายละเอียดการจอง', 'Order Details')}
                            </h5>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                Secondland {t('แดนมือสอง', 'Secondhand market')}
                            </p>

                            {/* Column Headers */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                            }}>
                                <span style={{ color: '#999', fontSize: '13px' }}>
                                    {t('บัตร', 'Ticket')}
                                </span>
                                <span style={{ color: '#999', fontSize: '13px' }}>
                                    {t('บาท', 'THB')}
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
                                        1 x EARLY BIRD : 22/02
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                                        350.00
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
                                        {t('ราคารวม', 'Subtotal')}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        350.00
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}>
                                    <span style={{ fontSize: '14px' }}>
                                        {t('ค่าบริการ', 'Service fee')}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        10.50
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
                                        {t('ค่าธรรมเนียม', 'Transaction fee')}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        3.85
                                    </span>
                                </div>

                                {/* Total */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                        {t('ราการวมทั้งสิ้น', 'Total')}
                                    </span>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        364.35
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
                                        {t('ข้อสำคัญ', 'Important')}
                                    </span>
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    fontSize: '13px',
                                    color: '#666'
                                }}>
                                    <li style={{ marginBottom: '5px' }}>
                                        {t('ราคาทั้งหมด รวม VAT แล้ว', 'All prices include VAT')}
                                    </li>
                                    <li>
                                        {t('การทำประกันไม่สามารถยกเลิกได้ทุกกรณี',
                                            'Insurance cannot be cancelled in any case')}
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
                                        {t('หมายเหตุ: เงื่อนไขการคืนประกัน',
                                            'Note: Refund Policy')}
                                    </span>
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '20px',
                                    fontSize: '13px',
                                    color: '#666'
                                }}>
                                    <li style={{ marginBottom: '5px' }}>
                                        {t('ต้องเกิดเหตุการณ์ภายใน 30 วันก่อนการแสดง',
                                            'Must occur within 30 days before the event')}
                                    </li>
                                    <li style={{ marginBottom: '5px' }}>
                                        {t('เหตุการณ์ที่เคลมได้: เจ็บป่วยหนัก, เสียชีวิต ครอบครัว, ก๊ษธรรมชาติ, อุบัติเหตุ, หมายศาล, ทำงานต่างจังหวัด, สอบโรงเรียน',
                                            'Claimable events: serious illness, death in family, natural disaster, accident, court summons, work transfer, school exam')}
                                    </li>
                                    <li>
                                        {t('ต้องแจ้งภายใน 30 วัน พร้อมเอกสารประกอบ',
                                            'Must notify within 30 days with supporting documents')}
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
                            {t('ยกเลิกคำสั่งซื้อ', 'Cancel Order')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentQRArea;