/**
 * Payment Data Layer
 * Mock data for payment (will be replaced by API calls)
 */

// Type definitions
export interface CartItem {
    id: number;
    title: string;
    instructor: string;
    credits: number;
    originalPrice: number | null;
    price: number;
    image: string;
}

export interface Voucher {
    type: 'percent' | 'fixed';
    value: number;
    minOrder?: number;
}

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

export interface CompanyInfo {
    name: string;
    taxId: string;
    address: string;
    branch: string;
}

// Sample cart items (for demo purposes)
export const SAMPLE_CART_ITEMS: CartItem[] = [
    {
        id: 1,
        title: 'React Zero to Hero: สร้างเว็บแอพพลิเคชัน',
        instructor: 'โค้ดพล',
        credits: 2,
        originalPrice: 3900,
        price: 2500,
        image: 'assets/img/courses/01.jpg',
    },
    {
        id: 2,
        title: 'UX/UI Design Masterclass',
        instructor: 'ดีไซน์เนอร์แอบ',
        credits: 2,
        originalPrice: null,
        price: 1990,
        image: 'assets/img/courses/02.jpg',
    },
    {
        id: 3,
        title: 'Data Science & Python: วิเคราะห์ข้อมูลธุรกิจ',
        instructor: 'ดร. ดาต้า',
        credits: 2,
        originalPrice: 6000,
        price: 4500,
        image: 'assets/img/courses/03.jpg',
    },
];

// Voucher codes configuration
export const VOUCHER_CODES: Record<string, Voucher> = {
    'WELCOME': { type: 'percent', value: 10 },
    'SAVE20': { type: 'percent', value: 20 },
    'PHARMA500': { type: 'fixed', value: 500 },
    'NEWUSER': { type: 'percent', value: 15, minOrder: 2000 },
    'VIP1000': { type: 'fixed', value: 1000, minOrder: 5000 },
};

// Initial state factories
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

// Payment method types
export type PaymentMethod = 'promptpay' | 'card';
export type ReceiptType = 'personal' | 'company';

// Tax rate constant
export const TAX_RATE = 0.07;
