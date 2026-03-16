/**
 * useVoucher Hook
 * Encapsulates voucher validation and application logic
 * Extracted from CheckoutArea.tsx for SOLID SRP compliance
 */

import { useState, useCallback } from 'react';
import { VOUCHER_CODES } from '../data/mockData';

interface UseVoucherReturn {
    // State
    voucherCode: string;
    discount: number;
    discountApplied: boolean;
    discountError: string;
    appliedCode: string;

    // Actions
    setVoucherCode: (code: string) => void;
    applyVoucher: (subtotal: number, t: (th: string, en: string) => string) => void;
    removeVoucher: () => void;
}

export const useVoucher = (): UseVoucherReturn => {
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [appliedCode, setAppliedCode] = useState('');

    const applyVoucher = useCallback((subtotal: number, t: (th: string, en: string) => string) => {
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
            setDiscountError(t(
                `ยอดขั้นต่ำ ${voucher.minOrder.toLocaleString()} บาท`,
                `Minimum order ${voucher.minOrder.toLocaleString()} THB`
            ));
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
    }, [voucherCode]);

    const removeVoucher = useCallback(() => {
        setDiscount(0);
        setDiscountApplied(false);
        setVoucherCode('');
        setAppliedCode('');
        setDiscountError('');
    }, []);

    return {
        // State
        voucherCode,
        discount,
        discountApplied,
        discountError,
        appliedCode,

        // Actions
        setVoucherCode,
        applyVoucher,
        removeVoucher,
    };
};

export default useVoucher;
