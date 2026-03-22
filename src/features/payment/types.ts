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

// --- Checkout-specific types (moved from mockData.ts) ---

/**
 * วิธีชำระเงินหน้า checkout
 */
export type CheckoutPaymentMethod = 'promptpay' | 'card';

/**
 * ประเภทใบเสร็จ
 */
export type ReceiptType = 'personal' | 'company';

/**
 * ข้อมูลที่อยู่
 */
export interface AddressInfo {
    addressNo: string;
    village: string;
    moo: string;
    soi: string;
    road: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
}

/**
 * ข้อมูลบริษัท
 */
export interface CompanyInfo {
    name: string;
    taxId: string;
    address: string;
    branch: string;
}

export const createInitialAddressInfo = (): AddressInfo => ({
    addressNo: '',
    village: '',
    moo: '',
    soi: '',
    road: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: ''
});

export const createInitialCompanyInfo = (): CompanyInfo => ({
    name: '',
    taxId: '',
    address: '',
    branch: ''
});
