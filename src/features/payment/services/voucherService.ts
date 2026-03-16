/**
 * VoucherService
 * Abstraction layer for voucher validation operations
 * Implements DIP (Dependency Inversion Principle) - depend on abstractions, not concretions
 * 
 * Currently: Validates against static data
 * Future: Can be extended to validate via API
 */

import { VOUCHER_CODES, type Voucher } from '../data/mockData';

export interface VoucherValidationResult {
    isValid: boolean;
    discount: number;
    errorMessage?: string;
    appliedCode?: string;
}

export interface IVoucherService {
    validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult>;
    getVoucherDetails(code: string): Voucher | undefined;
}

class VoucherService implements IVoucherService {
    async validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult> {
        const normalizedCode = code.toUpperCase().trim();

        if (!normalizedCode) {
            return {
                isValid: false,
                discount: 0,
                errorMessage: 'EMPTY_CODE',
            };
        }

        const voucher = VOUCHER_CODES[normalizedCode];

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

        let discountAmount = 0;
        if (voucher.type === 'percent') {
            discountAmount = Math.round(subtotal * (voucher.value / 100));
        } else {
            discountAmount = voucher.value;
        }

        return {
            isValid: true,
            discount: discountAmount,
            appliedCode: normalizedCode,
        };
    }

    getVoucherDetails(code: string): Voucher | undefined {
        return VOUCHER_CODES[code.toUpperCase().trim()];
    }
}

// Singleton instance
export const voucherService = new VoucherService();

export default voucherService;
