// Payment API Service
// Centralized service layer for all payment-related API calls.
// When the backend payment API is ready, replace the TODO mock blocks
// with real API calls — only this file needs to change.

import { api, toApiError } from '@/lib/api';
import type {
    CreateOrderRequest,
    PaymentResponse,
    Order,
    PaymentMethod,
    CreditCardInfo,
    PaymentStatus,
} from '../types';

export const paymentApi = {
    /**
     * สร้าง order จาก cart items
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async createOrder(request: CreateOrderRequest): Promise<PaymentResponse> {
        // --- เมื่อ API พร้อม ให้ uncomment ด้านล่าง แล้วลบ mock block ---
        // const response = await api.post<PaymentResponse>('/orders', request);
        // if (!response.success) throw toApiError(response, 'สร้างคำสั่งซื้อไม่สำเร็จ');
        // return response.data;

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockOrderId = `ORD-${Date.now()}`;
        return {
            success: true,
            orderId: mockOrderId,
            orderNumber: mockOrderId,
        };
    },

    /**
     * ชำระเงิน (redirect/charge)
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async processPayment(
        orderId: string,
        paymentMethod: PaymentMethod,
        paymentInfo?: CreditCardInfo,
    ): Promise<PaymentResponse> {
        // const response = await api.post<PaymentResponse>(`/orders/${orderId}/pay`, {
        //     paymentMethod,
        //     ...paymentInfo,
        // });
        // if (!response.success) throw toApiError(response, 'การชำระเงินล้มเหลว');
        // return response.data;

        await new Promise((resolve) => setTimeout(resolve, 1500));
        return { success: true, orderId };
    },

    /**
     * ยกเลิก order
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async cancelOrder(orderId: string): Promise<{ success: boolean }> {
        // const response = await api.post<{ success: boolean }>(`/orders/${orderId}/cancel`);
        // if (!response.success) throw toApiError(response, 'ยกเลิกคำสั่งซื้อไม่สำเร็จ');
        // return response.data;

        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
    },

    /**
     * สร้าง PromptPay QR code
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async generatePromptPayQR(
        orderId: string,
        amount: number,
    ): Promise<{ qrCode: string; expiresAt: string; reference: string }> {
        // const response = await api.post<{...}>(`/orders/${orderId}/promptpay`, { amount });
        // if (!response.success) throw toApiError(response, 'สร้าง QR Code ไม่สำเร็จ');
        // return response.data;

        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
            qrCode: 'mock-qr-placeholder',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            reference: `REF-${Date.now()}`,
        };
    },

    /**
     * เช็คสถานะ payment (สำหรับ polling)
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async checkPaymentStatus(
        orderId: string,
    ): Promise<{ status: PaymentStatus; paidAt?: string }> {
        // const response = await api.get<{...}>(`/orders/${orderId}/status`);
        // if (!response.success) throw toApiError(response, 'เช็คสถานะไม่สำเร็จ');
        // return response.data;

        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { status: 'pending' };
    },

    /**
     * ดึงรายละเอียด order
     * TODO: เปลี่ยนเป็น API call เมื่อ backend พร้อม
     */
    async getOrder(orderId: string): Promise<Order | null> {
        // const response = await api.get<Order>(`/orders/${orderId}`);
        // if (!response.success) throw toApiError(response, 'โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ');
        // return response.data;

        return null;
    },

    /**
     * ดึงประวัติ order ของ user (ใช้ API จริงแล้ว)
     */
    async getOrderHistory(
        page: number = 1,
        limit: number = 10,
    ): Promise<{ orders: Order[]; total: number }> {
        const response = await api.get<any>(
            `/orders/my?page=${page}&limit=${limit}`,
        );

        if (!response.success) {
            throw toApiError(response, 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ');
        }

        const rawOrders = response.data?.orders ?? [];
        const orders: Order[] = rawOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            items: (o.items || []).map((i: any) => ({
                courseId: i.courseId,
                title: i.title,
                price: i.price,
            })),
            subtotal: o.subtotal || o.total,
            discount: o.discount || 0,
            total: o.total,
            paymentMethod: o.paymentMethod || 'credit_card',
            status:
                o.status === 'PAID'
                    ? 'completed'
                    : o.status === 'CANCELLED'
                      ? 'cancelled'
                      : 'pending',
            createdAt: o.createdAt,
        }));

        return { orders, total: response.data?.total ?? orders.length };
    },
};
