"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useCart } from '@/features/cart/hooks';
import { useLanguage } from '@/features/i18n';
import {
    VOUCHER_CODES,
    createInitialAddressInfo,
    createInitialCompanyInfo,
    type PaymentMethod,
    type ReceiptType,
} from '../data/mockData';

const CheckoutArea = () => {
    const { t } = useLanguage();
    const { cartItems, removeFromCart, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
    const [receiptType, setReceiptType] = useState<ReceiptType>('personal');
    const [companyInfo, setCompanyInfo] = useState(createInitialCompanyInfo());
    const [addressInfo, setAddressInfo] = useState(createInitialAddressInfo());
    const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [appliedCode, setAppliedCode] = useState('');




    const applyVoucher = () => {
        const code = voucherCode.toUpperCase().trim();

        if (!code) {
            setDiscountError(t('กรุณากรอกโค้ดส่วนลด', 'Please enter a voucher code'));
            return;
        }

        const voucher = VOUCHER_CODES[code];

        if (!voucher) {
            setDiscountError(t('โค้ดส่วนลดไม่ถูกต้อง', 'Invalid voucher code'));
            setDiscount(0);
            setDiscountApplied(false);
            return;
        }

        if (voucher.minOrder && subtotal < voucher.minOrder) {
            setDiscountError(t(`ยอดขั้นต่ำ ${voucher.minOrder.toLocaleString()} บาท`, `Minimum order ${voucher.minOrder.toLocaleString()} THB`));
            setDiscount(0);
            setDiscountApplied(false);
            return;
        }

        let discountAmount = 0;
        if (voucher.type === 'percent') {
            discountAmount = Math.round(subtotal * (voucher.value / 100));
        } else {
            discountAmount = voucher.value;
        }

        setDiscount(discountAmount);
        setDiscountApplied(true);
        setDiscountError('');
        setAppliedCode(code);
    };

    const removeVoucher = () => {
        setDiscount(0);
        setDiscountApplied(false);
        setVoucherCode('');
        setAppliedCode('');
        setDiscountError('');
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal - discount;

    return (
        <>
            <section className="checkout-section section-padding">
                <div className="container">
                    <div className="row g-4">
                        {/* Left: Payment Options */}
                        <div className="col-lg-7">
                            <div className="payment-wrapper" style={{
                                background: '#fff',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                            }}>
                                <h5 className="payment-summary-title text-force-22 text-force-bold">{t('เลือกช่องทางชำระเงิน', 'Select Payment Method')}</h5>

                                {/* Payment Methods - Horizontal Layout */}
                                <div className="payment-methods d-flex gap-3 mb-4">
                                    {/* QR PromptPay */}
                                    <label
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px 20px',
                                            border: paymentMethod === 'promptpay' ? '2px solid #014D40' : '1px solid #e0e0e0',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            height: '80px',
                                        }}
                                    >
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: paymentMethod === 'promptpay' ? '#014D40' : '#fff',
                                            border: paymentMethod === 'promptpay' ? 'none' : '2px solid #ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {paymentMethod === 'promptpay' && (
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }}></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-force-20 text-force-bold" style={{ margin: 0, color: '#333' }}>QR PromptPay</p>
                                            <img
                                                src="/assets/img/prompt-pay-logo.png"
                                                alt="PromptPay"
                                                style={{ height: '24px', marginTop: '6px' }}
                                            />
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'promptpay'}
                                            onChange={() => setPaymentMethod('promptpay')}
                                            style={{ display: 'none' }}
                                        />
                                    </label>

                                    {/* Credit/Debit Card */}
                                    <label
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px 20px',
                                            border: paymentMethod === 'card' ? '2px solid #014D40' : '1px solid #e0e0e0',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            height: '80px',
                                        }}
                                    >
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: paymentMethod === 'card' ? '#014D40' : '#fff',
                                            border: paymentMethod === 'card' ? 'none' : '2px solid #ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {paymentMethod === 'card' && (
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }}></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-force-20 text-force-bold" style={{ margin: 0, color: '#333' }}>Credit/Debit Card</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" style={{ height: '18px' }} />
                                                <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 38.6 12.3'%3E%3Cpath fill='%231434CB' d='M16 11.9h2.5l1.6-10.2h-2.5L16 11.9zm10.7-10c-.7-.3-1.8-.5-3.1-.5-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.6 1.8 1 1.8 1.6 0 .9-1.1 1.3-2.2 1.3-1.5 0-2.3-.2-3.3-.7l-.5-.2-.5 3.3c.8.4 2.3.7 3.9.7 3.6 0 5.9-1.8 6-4.6 0-1.6-1-2.7-2.9-3.6-1.2-.6-1.9-1-1.9-1.6 0-.6.7-1.2 2-1.2 1.2 0 2 .2 2.7.5l.3.2.5-3.2z'/%3E%3Cpath fill='%231434CB' d='M36.1 1.7H34c-.6 0-1 .2-1.3.8l-4.7 9.4h2.6s.4-1.2.5-1.5h3.2c.1.3.3 1.5.3 1.5h2.3l-2.1-10.2zm-2.1 6.5l1-2.9 1.7 4.8h-2.7v-1.9z'/%3E%3Cpath fill='%23F5A800' d='M12.9 1.7L9.5 9.1l-.3-1.6c-.6-3-2.8-5-5.2-6L11 11.9h2.6l4-10.2h-2.5v-.2z'/%3E%3Cpath fill='%231434CB' d='M7 1.8h-7l-.1.4c2.8.7 5.7 1.9 6.7 3.4l1-3.6C7.5 1.8 7.2 1.8 7 1.8z'/%3E%3C/svg%3E" alt="Visa" style={{ height: '14px' }} />
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                {/* Receipt Type Selection */}
                                <div className="receipt-type-section mb-4">
                                    <div className="d-flex gap-3 mb-3">
                                        {/* Personal Receipt */}
                                        <label
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '14px 20px',
                                                border: receiptType === 'personal' ? '2px solid #014D40' : '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                background: '#fff',
                                            }}
                                        >
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: receiptType === 'personal' ? '#014D40' : '#fff',
                                                border: receiptType === 'personal' ? 'none' : '2px solid #ccc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {receiptType === 'personal' && (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></div>
                                                )}
                                            </div>
                                            <span className="text-force-20 text-force-bold" style={{ color: '#333' }}>
                                                {t('บุคคลธรรมดา', 'Personal')}
                                            </span>
                                            <input
                                                type="radio"
                                                name="receiptType"
                                                checked={receiptType === 'personal'}
                                                onChange={() => setReceiptType('personal')}
                                                style={{ display: 'none' }}
                                            />
                                        </label>

                                        {/* Company / Tax Invoice */}
                                        <label
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '14px 20px',
                                                border: receiptType === 'company' ? '2px solid #014D40' : '1px solid #e0e0e0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                background: '#fff',
                                            }}
                                        >
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: receiptType === 'company' ? '#014D40' : '#fff',
                                                border: receiptType === 'company' ? 'none' : '2px solid #ccc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {receiptType === 'company' && (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></div>
                                                )}
                                            </div>
                                            <span className="text-force-20 text-force-bold" style={{ color: '#333' }}>
                                                {t('อื่นๆ', 'Other')}
                                            </span>
                                            <input
                                                type="radio"
                                                name="receiptType"
                                                checked={receiptType === 'company'}
                                                onChange={() => setReceiptType('company')}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>

                                    {/* Company Form - Show when "อื่นๆ" is selected */}
                                    {receiptType === 'company' && (
                                        <div style={{ marginTop: '12px' }}>
                                            <p className="text-force-20 text-force-bold" style={{
                                                color: '#014D40',
                                                marginBottom: '10px',
                                                fontStyle: 'italic'
                                            }}>
                                                {t('กรณีออกในนามนิติบุคคล โปรดระบุที่อยู่และเลขประจำตัวผู้เสียภาษี', 'For corporate invoices, please provide address and tax ID')}
                                            </p>

                                            {/* Tax ID - Required */}
                                            <div className="mb-2">
                                                <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                    {t('เลขประจำตัวผู้เสียภาษี', 'Tax ID')} <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={companyInfo.taxId}
                                                    onChange={(e) => {
                                                        setCompanyInfo({ ...companyInfo, taxId: e.target.value });
                                                        if (e.target.value) setFormErrors({ ...formErrors, taxId: false });
                                                    }}
                                                    onBlur={(e) => {
                                                        if (!e.target.value) setFormErrors({ ...formErrors, taxId: true });
                                                    }}
                                                    maxLength={13}
                                                    className="text-force-20 text-force-bold"
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px',
                                                        border: formErrors.taxId ? '1px solid #ef4444' : '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        color: '#000'
                                                    }}
                                                />
                                                {formErrors.taxId && (
                                                    <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>
                                                        {t('กรุณากรอกเลขประจำตัวผู้เสียภาษี', 'Please enter Tax ID')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Address Dropdown */}
                                            <div className="mb-2">
                                                <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                    {t('ที่อยู่', 'Address')}
                                                </label>
                                                <select
                                                    className="text-force-20 text-force-bold"
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        color: '#000',
                                                        background: '#fff'
                                                    }}
                                                >
                                                    <option value="">{t('- เลือกที่อยู่ออกใบเสร็จ -', '- Select address -')}</option>
                                                </select>
                                            </div>

                                            {/* หรือ กรอกที่อยู่ที่ต้องการออกใบเสร็จ */}
                                            <p className="text-force-20 text-force-bold" style={{ color: '#014D40', marginBottom: '10px', marginTop: '10px' }}>
                                                {t('หรือ กรอกที่อยู่ที่ต้องการออกใบเสร็จ', 'Or enter address for receipt')}
                                            </p>

                                            {/* Address Row 1 - 3 equal columns */}
                                            <div className="d-flex gap-2 mb-2">
                                                {/* เลขที่ - Required */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('เลขที่', 'No.')} <span style={{ color: '#ef4444' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.addressNo}
                                                        onChange={(e) => {
                                                            setAddressInfo({ ...addressInfo, addressNo: e.target.value });
                                                            if (e.target.value) setFormErrors({ ...formErrors, addressNo: false });
                                                        }}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) setFormErrors({ ...formErrors, addressNo: true });
                                                        }}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: formErrors.addressNo ? '1px solid #ef4444' : '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                    {formErrors.addressNo && (
                                                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>{t('กรุณากรอกข้อมูล', 'Please enter data')}</span>
                                                    )}
                                                </div>
                                                {/* หมู่บ้าน/อาคาร */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('หมู่บ้าน/อาคาร', 'Village/Building')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.village}
                                                        onChange={(e) => setAddressInfo({ ...addressInfo, village: e.target.value })}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                </div>
                                                {/* หมู่ที่ */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('หมู่ที่', 'Moo')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.moo}
                                                        onChange={(e) => setAddressInfo({ ...addressInfo, moo: e.target.value })}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Address Row 2 - 3 equal columns */}
                                            <div className="d-flex gap-2 mb-2">
                                                {/* ตรอก/ซอย */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('ตรอก/ซอย', 'Soi')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.soi}
                                                        onChange={(e) => setAddressInfo({ ...addressInfo, soi: e.target.value })}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                </div>
                                                {/* ถนน */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('ถนน', 'Road')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.road}
                                                        onChange={(e) => setAddressInfo({ ...addressInfo, road: e.target.value })}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                </div>
                                                {/* ตำบล/แขวง - Required */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('ตำบล/แขวง', 'Sub-district')} <span style={{ color: '#ef4444' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.subDistrict}
                                                        onChange={(e) => {
                                                            setAddressInfo({ ...addressInfo, subDistrict: e.target.value });
                                                            if (e.target.value) setFormErrors({ ...formErrors, subDistrict: false });
                                                        }}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) setFormErrors({ ...formErrors, subDistrict: true });
                                                        }}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: formErrors.subDistrict ? '1px solid #ef4444' : '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                    {formErrors.subDistrict && (
                                                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>{t('กรุณากรอกข้อมูล', 'Please enter data')}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Address Row 3 - 3 equal columns */}
                                            <div className="d-flex gap-2 mb-2">
                                                {/* อำเภอ/เขต - Required */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('อำเภอ/เขต', 'District')} <span style={{ color: '#ef4444' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.district}
                                                        onChange={(e) => {
                                                            setAddressInfo({ ...addressInfo, district: e.target.value });
                                                            if (e.target.value) setFormErrors({ ...formErrors, district: false });
                                                        }}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) setFormErrors({ ...formErrors, district: true });
                                                        }}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: formErrors.district ? '1px solid #ef4444' : '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                    {formErrors.district && (
                                                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>{t('กรุณากรอกข้อมูล', 'Please enter data')}</span>
                                                    )}
                                                </div>
                                                {/* จังหวัด - Required (Changed to input) */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('จังหวัด', 'Province')} <span style={{ color: '#ef4444' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.province}
                                                        onChange={(e) => {
                                                            setAddressInfo({ ...addressInfo, province: e.target.value });
                                                            if (e.target.value) setFormErrors({ ...formErrors, province: false });
                                                        }}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) setFormErrors({ ...formErrors, province: true });
                                                        }}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: formErrors.province ? '1px solid #ef4444' : '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                    {formErrors.province && (
                                                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>{t('กรุณากรอกข้อมูล', 'Please enter data')}</span>
                                                    )}
                                                </div>
                                                {/* รหัสไปรษณีย์ - Required */}
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-force-20 text-force-bold" style={{ color: '#000', marginBottom: '8px', display: 'block' }}>
                                                        {t('รหัสไปรษณีย์', 'Postal Code')} <span style={{ color: '#ef4444' }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressInfo.postalCode}
                                                        onChange={(e) => {
                                                            setAddressInfo({ ...addressInfo, postalCode: e.target.value });
                                                            if (e.target.value) setFormErrors({ ...formErrors, postalCode: false });
                                                        }}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) setFormErrors({ ...formErrors, postalCode: true });
                                                        }}
                                                        maxLength={5}
                                                        className="text-force-20 text-force-bold"
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px',
                                                            border: formErrors.postalCode ? '1px solid #ef4444' : '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            color: '#000'
                                                        }}
                                                    />
                                                    {formErrors.postalCode && (
                                                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>{t('กรุณากรอกข้อมูล', 'Please enter data')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={() => {
                                        // Validate required fields when receipt type is company
                                        if (receiptType === 'company') {
                                            const errors: { [key: string]: boolean } = {};
                                            let hasError = false;

                                            if (!companyInfo.taxId) { errors.taxId = true; hasError = true; }
                                            if (!addressInfo.addressNo) { errors.addressNo = true; hasError = true; }
                                            if (!addressInfo.subDistrict) { errors.subDistrict = true; hasError = true; }
                                            if (!addressInfo.district) { errors.district = true; hasError = true; }
                                            if (!addressInfo.province) { errors.province = true; hasError = true; }
                                            if (!addressInfo.postalCode) { errors.postalCode = true; hasError = true; }

                                            setFormErrors(errors);

                                            if (hasError) {
                                                alert(t('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'Please fill in all required fields'));
                                                return;
                                            }
                                        }
                                        window.location.href = paymentMethod === 'promptpay' ? '/payment-qr' : '/payment-card';
                                    }}
                                    disabled={cartItems.length === 0}
                                    className="text-force-20"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: cartItems.length === 0 ? '#ccc' : '#014D40',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '500',
                                        cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                                        marginBottom: '16px'
                                    }}
                                >
                                    {t('ดำเนินการชำระเงิน', 'Proceed to Payment')}
                                </button>

                                {/* Terms */}
                                <p className="text-center text-force-16" style={{ color: '#4b5563', margin: 0, marginTop: '8px' }}>
                                    {t('โดยการดำเนินการต่อ คุณยอมรับ', 'By proceeding, you agree to')}{' '}
                                    <Link href="#" style={{ color: '#014D40', fontWeight: 'bold', textDecoration: 'underline' }}>{t('เงื่อนไขการให้บริการ', 'Terms of Service')}</Link>
                                    {' '}{t('และ', 'and')}{' '}
                                    <Link href="#" style={{ color: '#014D40', fontWeight: 'bold', textDecoration: 'underline' }}>{t('นโยบายความเป็นส่วนตัว', 'Privacy Policy')}</Link>
                                    {' '}{t('ของ CourseD', 'of CourseD')}
                                </p>
                            </div>
                        </div>

                        {/* Right: Cart Items */}
                        <div className="col-lg-5">
                            <div className="cart-wrapper" style={{
                                background: '#fff',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                            }}>
                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="text-force-22 text-force-bold" style={{ color: '#333', margin: 0 }}>
                                        {t('คอร์สเรียน', 'Courses')} ({cartItems.length})
                                    </h5>
                                    <button
                                        onClick={clearCart}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {t('ลบทั้งหมด', 'clear all')}
                                    </button>
                                </div>

                                {/* Cart Items */}
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-shopping-cart" style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }}></i>
                                        <p style={{ color: '#666' }}>{t('ไม่มีคอร์สในตะกร้า', 'No courses in cart')}</p>
                                        <Link href="/courses-grid" className="theme-btn" style={{ padding: '10px 24px' }}>
                                            {t('เลือกคอร์สเรียน', 'Browse Courses')}
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="cart-items checkout-cart-items" style={{ marginBottom: '16px' }}>
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="cart-item d-flex gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                {/* Course Image */}
                                                <div style={{
                                                    width: '80px',
                                                    height: '55px',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    flexShrink: 0
                                                }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>

                                                {/* Course Info */}
                                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                    <h6 style={{
                                                        color: '#014D40',
                                                        marginBottom: '2px',
                                                        fontSize: '16px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {item.title}
                                                    </h6>
                                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                                                        Instructors: {item.instructor}
                                                    </p>
                                                    <span style={{
                                                        background: '#E8F8F4',
                                                        color: '#014D40',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px'
                                                    }}>
                                                        {item.credits} Credit
                                                    </span>
                                                </div>

                                                {/* Price & Remove */}
                                                <div className="text-end" style={{ minWidth: '80px' }}>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#999',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            marginBottom: '4px',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    <div>
                                                        {item.originalPrice && (
                                                            <p style={{
                                                                color: '#999',
                                                                fontSize: '11px',
                                                                textDecoration: 'line-through',
                                                                marginBottom: '1px'
                                                            }}>
                                                                {item.originalPrice.toLocaleString()} {t('บาท', 'THB')}
                                                            </p>
                                                        )}
                                                        <p className="text-force-20 font-bold" style={{
                                                            color: '#014D40',
                                                            margin: 0
                                                        }}>
                                                            {item.price.toLocaleString()} {t('บาท', 'THB')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Voucher Code Section */}
                                <div className="voucher-section mb-3">
                                    <label className="text-force-20 text-force-bold" style={{ color: '#333', marginBottom: '8px', display: 'block' }}>
                                        {t('โค้ดส่วนลด / VOUCHER', 'Discount Code / VOUCHER')}
                                    </label>
                                    {!discountApplied ? (
                                        <div className="d-flex gap-2">
                                            <input
                                                type="text"
                                                placeholder=""
                                                value={voucherCode}
                                                onChange={(e) => {
                                                    setVoucherCode(e.target.value);
                                                    setDiscountError('');
                                                }}
                                                onKeyPress={(e) => e.key === 'Enter' && applyVoucher()}
                                                className="text-force-20 text-force-bold"
                                                style={{
                                                    flex: 1,
                                                    padding: '14px',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '6px',
                                                    color: '#333'
                                                }}
                                            />
                                            <button
                                                onClick={applyVoucher}
                                                className="text-force-20 text-force-bold"
                                                style={{
                                                    background: '#014D40',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '14px 24px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {t('ยืนยัน', 'Apply')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            background: '#f0fdf4',
                                            border: '1px solid #22c55e',
                                            borderRadius: '6px'
                                        }}>
                                            <span style={{ color: '#166534', fontWeight: '500', fontSize: '13px' }}>
                                                {appliedCode} - {t('ลด', 'Save')} ฿{discount.toLocaleString()}
                                            </span>
                                            <button
                                                onClick={removeVoucher}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#666',
                                                    cursor: 'pointer',
                                                    padding: '2px'
                                                }}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="order-summary">
                                    <h6 className="text-force-20 text-force-bold" style={{ color: '#333', marginBottom: '12px' }}>{t('สรุปยอดชำระ', 'Order Summary')}</h6>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-force-18" style={{ color: '#666' }}>{t('ราคารวม', 'Subtotal')} ({cartItems.length} {t('รายการ', 'items')})</span>
                                        <span className="text-force-18">{subtotal.toLocaleString()} {t('บาท', 'THB')}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span style={{ color: '#22c55e', fontSize: '13px' }}>
                                                {t('ส่วนลด', 'Discount')} ({appliedCode})
                                            </span>
                                            <span style={{ color: '#22c55e', fontSize: '13px' }}>-{discount.toLocaleString()} {t('บาท', 'THB')}</span>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between mb-3">
                                        <span style={{ color: '#666', fontSize: '16px' }}>{t('ภาษี (7%)', 'VAT 7%')}</span>
                                        <span style={{ color: '#999', fontSize: '14px', textDecoration: 'underline' }}>{t('รวมในราคาขายแล้ว', 'Included in price')}</span>
                                    </div>

                                    <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid #e0e0e0' }}>
                                        <strong className="text-force-22 text-force-bold" style={{ color: '#333' }}>{t('ยอดสุทธิ', 'Total')}</strong>
                                        <strong className="text-force-30 text-force-bold" style={{ color: '#014D40' }}>
                                            {total.toLocaleString()} {t('บาท', 'THB')}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CheckoutArea;

