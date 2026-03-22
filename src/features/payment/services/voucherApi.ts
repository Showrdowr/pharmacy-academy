// Voucher API Service
// Centralized service layer for voucher validation.
// When the backend voucher API is ready, replace the TODO mock blocks
// with real API calls — only this file needs to change.

import { api, toApiError } from '@/lib/api';

export interface VoucherValidationResult {
    isValid: boolean;
    discount: number;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    errorMessage?: string;
    appliedCode?: string;
}

export const voucherApi = {
    /**
     * ตรวจสอบ voucher code กับ subtotal
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async validateVoucher(
        code: string,
        subtotal: number,
    ): Promise<VoucherValidationResult> {
        // --- เมื่อ API พร้อม ให้ uncomment ด้านล่าง แล้วลบ mock block ---
        // const response = await api.post<VoucherValidationResult>('/vouchers/validate', {
        //     code,
        //     subtotal,
        // });
        // if (!response.success) throw toApiError(response, 'ตรวจสอบโค้ดส่วนลดไม่สำเร็จ');
        // return response.data;

        const normalizedCode = code.toUpperCase().trim();

        if (!normalizedCode) {
            return { isValid: false, discount: 0, errorMessage: 'EMPTY_CODE' };
        }

        // Mock voucher codes — ลบเมื่อเชื่อม API จริง
        const MOCK_VOUCHERS: Record<
            string,
            { type: 'percent' | 'fixed'; value: number; minOrder?: number }
        > = {
            WELCOME: { type: 'percent', value: 10 },
            SAVE20: { type: 'percent', value: 20 },
            PHARMA500: { type: 'fixed', value: 500 },
            NEWUSER: { type: 'percent', value: 15, minOrder: 2000 },
            VIP1000: { type: 'fixed', value: 1000, minOrder: 5000 },
            DISCOUNT10: { type: 'percent', value: 10 },
        };

        const voucher = MOCK_VOUCHERS[normalizedCode];

        if (!voucher) {
            return {
                isValid: false,
                discount: 0,
                errorMessage: 'INVALID_CODE',
            };
        }

        if (voucher.minOrder && subtotal < voucher.minOrder) {
            return {
                isValid: false,
                discount: 0,
                errorMessage: `MIN_ORDER_${voucher.minOrder}`,
            };
        }

        const discountAmount =
            voucher.type === 'percent'
                ? Math.round(subtotal * (voucher.value / 100))
                : voucher.value;

        return {
            isValid: true,
            discount: discountAmount,
            appliedCode: normalizedCode,
        };
    },
};
