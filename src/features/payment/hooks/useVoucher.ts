/**
 * useVoucher Hook
 * Encapsulates voucher validation and application logic
 * Extracted from CheckoutArea.tsx for SOLID SRP compliance
 */

import { useState, useCallback } from 'react';
import { voucherApi } from '../services/voucherApi';

interface UseVoucherReturn {
    // State
    voucherCode: string;
    discount: number;
    discountApplied: boolean;
    discountError: string;
    appliedCode: string;

    // Actions
    setVoucherCode: (code: string) => void;
    applyVoucher: (subtotal: number, t: (th: string, en: string) => string) => Promise<void>;
    removeVoucher: () => void;
}

export const useVoucher = (): UseVoucherReturn => {
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [appliedCode, setAppliedCode] = useState('');

    const applyVoucher = useCallback(async (subtotal: number, t: (th: string, en: string) => string) => {
        const code = voucherCode.toUpperCase().trim();

        if (!code) {
            setDiscountError(t('กรุณากรอกโค้ดส่วนลด', 'Please enter a voucher code'));
            return;
        }

        try {
            const result = await voucherApi.validateVoucher(code, subtotal);

            if (!result.isValid) {
                const errorMsg = result.errorMessage?.startsWith('MIN_ORDER_')
                    ? t(
                          `ยอดขั้นต่ำ ${result.errorMessage.replace('MIN_ORDER_', '')} บาท`,
                          `Minimum order ${result.errorMessage.replace('MIN_ORDER_', '')} THB`,
                      )
                    : t('โค้ดส่วนลดไม่ถูกต้อง', 'Invalid voucher code');
                setDiscountError(errorMsg);
                setDiscount(0);
                setDiscountApplied(false);
                return;
            }

            setDiscount(result.discount);
            setDiscountApplied(true);
            setDiscountError('');
            setAppliedCode(result.appliedCode || code);
        } catch {
            setDiscountError(t('ไม่สามารถตรวจสอบโค้ดส่วนลดได้', 'Failed to validate voucher code'));
            setDiscount(0);
            setDiscountApplied(false);
        }
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
