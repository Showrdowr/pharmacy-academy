// Payment Hooks - Business logic for payment
'use client';

import { useState, useCallback, useEffect } from 'react';
import { paymentApi } from './services/paymentApi';
import { voucherApi } from './services/voucherApi';
import { getClientMessage } from '@/features/i18n/runtime';
import type {
    PaymentMethod,
    CreateOrderRequest,
    PaymentResponse,
    Order,
    CreditCardInfo,
} from './types';

/**
 * usePayment hook
 * ใช้สำหรับจัดการการชำระเงิน
 */
export function usePayment() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

    const createOrder = useCallback(async (request: CreateOrderRequest): Promise<PaymentResponse> => {
        setIsProcessing(true);
        setError(null);

        try {
            return await paymentApi.createOrder(request);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : getClientMessage('payment.fallbacks.genericError');
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const processPayment = useCallback(async (
        orderId: string,
        paymentMethod: PaymentMethod,
        paymentInfo?: CreditCardInfo
    ): Promise<PaymentResponse> => {
        setIsProcessing(true);
        setError(null);

        try {
            return await paymentApi.processPayment(orderId, paymentMethod, paymentInfo);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : getClientMessage('payment.fallbacks.paymentFailed');
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
        try {
            const result = await paymentApi.cancelOrder(orderId);
            return result.success;
        } catch {
            return false;
        }
    }, []);

    return {
        isProcessing,
        error,
        currentOrder,
        createOrder,
        processPayment,
        cancelOrder,
        setCurrentOrder,
    };
}

/**
 * usePaymentHistory hook
 * ใช้สำหรับดูประวัติการชำระเงิน
 */
export function usePaymentHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async (page = 1, limit = 10) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await paymentApi.getOrderHistory(page, limit);
            setOrders(result.orders);
        } catch (err) {
            setError(err instanceof Error ? err.message : getClientMessage('payment.fallbacks.loadOrderHistoryFailed'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        orders,
        isLoading,
        error,
        fetchHistory,
    };
}

/**
 * usePromptPay hook
 * ใช้สำหรับ PromptPay payment
 */
export function usePromptPay() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const generateQR = useCallback(async (orderId: string, amount: number) => {
        try {
            const result = await paymentApi.generatePromptPayQR(orderId, amount);
            setQrCode(result.qrCode);
            setExpiresAt(result.expiresAt);
        } catch (err) {
            console.error('Failed to generate QR:', err);
        }
    }, []);

    const checkPaymentStatus = useCallback(async (orderId: string): Promise<boolean> => {
        setIsChecking(true);
        try {
            const result = await paymentApi.checkPaymentStatus(orderId);
            return result.status === 'completed';
        } finally {
            setIsChecking(false);
        }
    }, []);

    return {
        qrCode,
        expiresAt,
        isChecking,
        generateQR,
        checkPaymentStatus,
    };
}

/**
 * useCoupon hook
 * ใช้สำหรับ apply coupon code
 */
export function useCoupon() {
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount: number;
    } | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const applyCoupon = useCallback(async (code: string, cartTotal: number): Promise<boolean> => {
        setIsValidating(true);
        setError(null);

        try {
            const result = await voucherApi.validateVoucher(code, cartTotal);

            if (result.isValid) {
                setAppliedCoupon({
                    code: result.appliedCode || code.toUpperCase(),
                    discount: result.discount,
                });
                return true;
            }

            const errorMessage = result.errorMessage?.startsWith('MIN_ORDER_')
                ? getClientMessage('payment.checkout.voucherMinimumOrder', {
                    amount: result.errorMessage.replace('MIN_ORDER_', ''),
                })
                : getClientMessage('payment.checkout.voucherInvalid');
            setError(errorMessage);
            return false;
        } catch {
            setError(getClientMessage('payment.checkout.voucherValidateFailed'));
            return false;
        } finally {
            setIsValidating(false);
        }
    }, []);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setError(null);
    }, []);

    return {
        appliedCoupon,
        isValidating,
        error,
        applyCoupon,
        removeCoupon,
    };
}
