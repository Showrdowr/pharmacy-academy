// Payment Hooks - Business logic for payment
'use client';

import { useState, useCallback } from 'react';
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
            // TODO: Replace with actual API call
            // const response = await paymentService.createOrder(request);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock response
            const mockOrderId = `ORD-${Date.now()}`;

            return {
                success: true,
                orderId: mockOrderId,
                orderNumber: mockOrderId,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
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
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            return { success: true, orderId };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'การชำระเงินล้มเหลว';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            return true;
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
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            setOrders([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Mock QR code
            setQrCode('mock-qr-code-data');
            setExpiresAt(new Date(Date.now() + 15 * 60 * 1000).toISOString()); // 15 minutes
        } catch (err) {
            console.error('Failed to generate QR:', err);
        }
    }, []);

    const checkPaymentStatus = useCallback(async (orderId: string): Promise<boolean> => {
        setIsChecking(true);
        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return false; // Not paid yet
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
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Mock validation
            if (code.toUpperCase() === 'DISCOUNT10') {
                setAppliedCoupon({
                    code: code.toUpperCase(),
                    discount: cartTotal * 0.1,
                });
                return true;
            }

            setError('รหัสส่วนลดไม่ถูกต้อง');
            return false;
        } catch {
            setError('ไม่สามารถตรวจสอบรหัสส่วนลดได้');
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
