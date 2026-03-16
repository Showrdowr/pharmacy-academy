// Cart Types for Pharmacy Academy LMS

/**
 * Item ในตะกร้า
 */
export interface CartItem {
    id: number;
    title: string;
    instructor: string;
    price: number;
    originalPrice?: number;
    image: string;
    category?: string;
    cpeCredits?: number;
    rating?: number;
    credits?: number;
    cpe?: number;
}

/**
 * สถานะตะกร้า
 */
export interface CartState {
    items: CartItem[];
    cartItems: CartItem[]; // alias for backward compatibility
    isHydrated: boolean;
}

/**
 * Actions สำหรับตะกร้า
 */
export interface CartActions {
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    isInCart: (id: number) => boolean;
}

/**
 * Computed values
 */
export interface CartComputedValues {
    cartCount: number;
    cartTotal: number;
    totalOriginalPrice: number;
    totalDiscount: number;
}

/**
 * Cart Context Type
 */
export interface CartContextType extends CartState, CartActions, CartComputedValues { }

/**
 * Coupon Code
 */
export interface CouponCode {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    expiresAt?: string;
}

/**
 * Applied Coupon
 */
export interface AppliedCoupon extends CouponCode {
    discountAmount: number;
}
