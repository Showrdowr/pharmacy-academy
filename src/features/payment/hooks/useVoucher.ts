/**
 * useVoucher Hook
 * Encapsulates voucher validation and application logic
 * Extracted from CheckoutArea.tsx for SOLID SRP compliance
 */

import { useState, useCallback } from 'react';
import { getClientMessage } from '@/features/i18n/runtime';
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
    applyVoucher: (subtotal: number) => Promise<void>;
    removeVoucher: () => void;
}

export const useVoucher = (): UseVoucherReturn => {
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [appliedCode, setAppliedCode] = useState('');

    const applyVoucher = useCallback(async (subtotal: number) => {
        const code = voucherCode.toUpperCase().trim();

        if (!code) {
            setDiscountError(getClientMessage('payment.checkout.voucherRequired'));
            return;
        }

        try {
            const result = await voucherApi.validateVoucher(code, subtotal);

            if (!result.isValid) {
                const errorMsg = result.errorMessage?.startsWith('MIN_ORDER_')
                    ? getClientMessage('payment.checkout.voucherMinimumOrder', {
                        amount: result.errorMessage.replace('MIN_ORDER_', ''),
                    })
                    : getClientMessage('payment.checkout.voucherInvalid');
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
            setDiscountError(getClientMessage('payment.checkout.voucherValidateFailed'));
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
