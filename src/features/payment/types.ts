// Payment Types for Pharmacy Academy LMS

/**
 * วิธีการชำระเงิน
 */
export type PaymentMethod = 'credit_card' | 'promptpay' | 'bank_transfer';

/**
 * สถานะการชำระเงิน
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

/**
 * ข้อมูลบัตรเครดิต
 */
export interface CreditCardInfo {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

/**
 * ข้อมูล PromptPay
 */
export interface PromptPayInfo {
    qrCode: string;
    amount: number;
    expiresAt: string;
    reference: string;
}

/**
 * รายการสั่งซื้อ
 */
export interface OrderItem {
    courseId: number;
    title: string;
    price: number;
    originalPrice?: number;
}

/**
 * Order
 */
export interface Order {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    createdAt: string;
    paidAt?: string;
    couponCode?: string;
}

/**
 * สร้าง Order Request
 */
export interface CreateOrderRequest {
    items: { courseId: number }[];
    paymentMethod: PaymentMethod;
    couponCode?: string;
}

/**
 * Payment Response
 */
export interface PaymentResponse {
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    redirectUrl?: string;
    qrCode?: string;
    error?: string;
}

/**
 * ประวัติการชำระเงิน
 */
export interface PaymentHistory {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
}
