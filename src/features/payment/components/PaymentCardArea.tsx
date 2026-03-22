"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/features/i18n';
import { useOrderStore } from '@/stores/useOrderStore';

const PaymentCardArea = () => {
    const { language, t } = useLanguage();
    const router = useRouter();
    const { orderId, orderTotal, orderNumber } = useOrderStore();
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1 * 60); // 1 minutes in seconds

    useEffect(() => {
        if (!orderId) {
            router.replace('/checkout');
        }
    }, [orderId, router]);

    useEffect(() => {
        if (timeLeft <= 0) {
            // Redirect to payment fail page when timeout
            router.push('/payment-fail?type=card');
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Format card number with spaces (numbers only)
        if (e.target.name === 'cardNumber') {
            // Remove all non-digit characters first
            value = value.replace(/\D/g, '');
            // Add spaces every 4 digits
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            if (value.length > 19) return;
        }

        // Format expiry date (numbers only)
        if (e.target.name === 'expiry') {
            value = value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            if (value.length > 5) return;
        }

        // Limit CVV (numbers only)
        if (e.target.name === 'cvv') {
            // Remove all non-digit characters
            value = value.replace(/\D/g, '');
            if (value.length > 3) return;
        }

        setCardData({
            ...cardData,
            [e.target.name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            window.location.href = '/payment-success';
        }, 2000);
    };

    // Sample order data
    const orderItems = [
        { name: 'เภสัชวิทยาคลินิกเบื้องต้น', nameEn: 'Clinical Pharmacology Basics', price: 1500 },
        { name: 'การบริบาลผู้ป่วยเบาหวาน', nameEn: 'Diabetes Patient Care', price: 1800 },
        { name: 'กฎหมายเภสัชกรรม', nameEn: 'Pharmacy Law', price: 1200 },
    ];
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <section className="payment-card-section section-padding">
            <div className="container">
                <div className="row g-4">
                    {/* Left: Card Form */}
                    <div className="col-lg-6">
                        <div className="card-form-wrapper" style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                        }}>
                            <h4 className="payment-page-title">
                                {t('ชำระเงินด้วยบัตรเครดิต/เดบิต', 'Pay with Credit/Debit Card')}
                            </h4>

                            {/* Countdown Timer */}
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 30px',
                                    background: 'linear-gradient(135deg, #014D40 0%, #014D40 100%)',
                                    color: '#fff',
                                    borderRadius: '30px',
                                    boxShadow: '0 4px 15px rgba(1, 77, 64, 0.3)',
                                }} className="text-xl font-semibold">
                                    <i className="far fa-clock"></i>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Card Number */}
                                <div className="mb-4">
                                    <label className="payment-label text-force-20 text-force-bold">
                                        {t('หมายเลขบัตร', 'Card Number')}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardData.cardNumber}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                padding: '16px 60px 16px 20px',
                                                border: '1px solid #e0e0e0',
                                                outline: 'none'
                                            }}
                                            className="payment-input text-force-20 text-force-bold"
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            display: 'flex',
                                            gap: '4px'
                                        }}>
                                            <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 38.6 12.3'%3E%3Cpath fill='%231434CB' d='M16 11.9h2.5l1.6-10.2h-2.5L16 11.9zm10.7-10c-.7-.3-1.8-.5-3.1-.5-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.6 1.8 1 1.8 1.6 0 .9-1.1 1.3-2.2 1.3-1.5 0-2.3-.2-3.3-.7l-.5-.2-.5 3.3c.8.4 2.3.7 3.9.7 3.6 0 5.9-1.8 6-4.6 0-1.6-1-2.7-2.9-3.6-1.2-.6-1.9-1-1.9-1.6 0-.6.7-1.2 2-1.2 1.2 0 2 .2 2.7.5l.3.2.5-3.2z'/%3E%3Cpath fill='%231434CB' d='M36.1 1.7H34c-.6 0-1 .2-1.3.8l-4.7 9.4h2.6s.4-1.2.5-1.5h3.2c.1.3.3 1.5.3 1.5h2.3l-2.1-10.2zm-2.1 6.5l1-2.9 1.7 4.8h-2.7v-1.9z'/%3E%3Cpath fill='%23F5A800' d='M12.9 1.7L9.5 9.1l-.3-1.6c-.6-3-2.8-5-5.2-6L11 11.9h2.6l4-10.2h-2.5v-.2z'/%3E%3Cpath fill='%231434CB' d='M7 1.8h-7l-.1.4c2.8.7 5.7 1.9 6.7 3.4l1-3.6C7.5 1.8 7.2 1.8 7 1.8z'/%3E%3C/svg%3E" alt="Visa" style={{ height: '20px' }} />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" style={{ height: '20px' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Name */}
                                <div className="mb-4">
                                    <label className="payment-label text-force-20 text-force-bold">
                                        {t('ชื่อบนบัตร', 'Name on Card')}
                                    </label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        placeholder={t('ชื่อตามที่ปรากฏบนบัตร', 'Name as it appears on card')}
                                        value={cardData.cardName}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '12px',
                                            color: '#333',
                                            outline: 'none'
                                        }}
                                        className="text-force-20 text-force-bold w-full"
                                    />
                                </div>

                                {/* Expiry & CVV */}
                                <div className="row">
                                    <div className="col-6 mb-4">
                                        <label className="payment-label text-force-20 text-force-bold">
                                            {t('วันหมดอายุ', 'Expiry Date')}
                                        </label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={cardData.expiry}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                padding: '16px 20px',
                                                border: '1px solid #e0e0e0',
                                                outline: 'none'
                                            }}
                                            className="payment-input text-force-20 text-force-bold"
                                        />
                                    </div>
                                    <div className="col-6 mb-4">
                                        <label className="payment-label text-force-20 text-force-bold">
                                            CVV
                                        </label>
                                        <input
                                            type="password"
                                            name="cvv"
                                            placeholder="123"
                                            value={cardData.cvv}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                padding: '16px 20px',
                                                border: '1px solid #e0e0e0',
                                                outline: 'none'
                                            }}
                                            className="payment-input text-force-20 text-force-bold"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: isProcessing ? '#ccc' : '#014D40',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    className="payment-btn-main text-force-20 text-force-bold"
                                >
                                    {isProcessing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            {t('กำลังดำเนินการ...', 'Processing...')}
                                        </>
                                    ) : (
                                        <>{t('ชำระเงิน', 'Pay')} ฿{total.toLocaleString()}</>
                                    )}
                                </button>
                            </form>

                            {/* Alternative Payment */}
                            <div className="text-center mt-4">
                                <a
                                    href="/payment-qr"
                                    style={{
                                        color: '#014D40',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                    className="payment-summary-price"
                                >
                                    <i className="fas fa-qrcode"></i>
                                    {t('ชำระผ่าน QR Code แทน', 'Pay via QR Code instead')}
                                </a>
                            </div>


                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="col-lg-6">
                        <div className="order-summary-wrapper" style={{
                            background: '#f8f9fa',
                            borderRadius: '16px',
                            padding: '32px'
                        }}>
                            <h5 className="payment-summary-title text-force-22 text-force-bold">{t('สรุปรายการ', 'Order Summary')}</h5>

                            {/* Order Items */}
                            {orderItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="d-flex justify-content-between mb-3 pb-3"
                                    style={{ borderBottom: index < orderItems.length - 1 ? '1px solid #e0e0e0' : 'none' }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p className="payment-summary-item text-force-18" style={{ margin: 0, color: '#333' }}>
                                            {language === 'th' ? item.name : item.nameEn}
                                        </p>
                                    </div>
                                    <span className="payment-summary-price text-force-18 text-force-bold">
                                        ฿{item.price.toLocaleString()}
                                    </span>
                                </div>
                            ))}

                            <hr style={{ margin: '16px 0' }} />

                            {/* Totals */}
                            <div className="d-flex justify-content-between mb-2">
                                <span className="payment-summary-sublabel text-force-18">{t('ราคารวม', 'Subtotal')}</span>
                                <span className="payment-summary-item text-force-18 text-force-bold">฿{total.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="payment-summary-sublabel text-force-18">{t('ส่วนลด', 'Discount')}</span>
                                <span className="payment-summary-item text-force-18 text-force-bold" style={{ color: '#ed0606ff' }}>-฿0</span>
                            </div>

                            <hr style={{ margin: '16px 0' }} />

                            <div className="d-flex justify-content-between">
                                <strong className="payment-total-label text-force-22 text-force-bold">{t('รวมทั้งหมด', 'Total')}</strong>
                                <strong className="payment-total-amount text-force-30 text-force-bold">฿{total.toLocaleString()}</strong>
                            </div>

                            {/* Back Link */}
                            <a
                                href="/checkout"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: '24px',
                                    color: '#666',
                                    textDecoration: 'none',
                                }}
                                className="text-force-16 font-medium"
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                {t('กลับไปหน้าตะกร้า', 'Back to Cart')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentCardArea;
