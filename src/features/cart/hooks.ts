// Cart Hooks - Business logic for shopping cart
'use client';

import { useCallback, useMemo } from 'react';
import { useCartStore } from '@/stores/useCartStore';
import type { CartContextType, CartItem } from './types';

/**
 * useCart hook
 * ใช้สำหรับเข้าถึง cart state และ actions ทั้งหมด
 */
export function useCart(): CartContextType {
    return useCartStore();
}

/**
 * useCartItems hook
 * ใช้สำหรับเข้าถึงรายการใน cart เท่านั้น
 */
export function useCartItems(): CartItem[] {
    const { items } = useCart();
    return items;
}

/**
 * useCartCount hook
 * ใช้สำหรับแสดงจำนวนรายการใน cart (badge)
 */
export function useCartCount(): number {
    const { cartCount } = useCart();
    return cartCount;
}

/**
 * useCartTotal hook
 * ใช้สำหรับแสดงยอดรวม
 */
export function useCartTotal(): {
    total: number;
    originalTotal: number;
    discount: number;
} {
    const { cartTotal, totalOriginalPrice, totalDiscount } = useCart();
    return {
        total: cartTotal,
        originalTotal: totalOriginalPrice,
        discount: totalDiscount,
    };
}

/**
 * useAddToCart hook
 * ใช้สำหรับปุ่ม Add to Cart
 */
export function useAddToCart() {
    const { addToCart, isInCart } = useCart();

    const handleAddToCart = useCallback(
        (item: CartItem) => {
            if (!Number.isFinite(Number(item.price)) || Number(item.price) <= 0) {
                return false;
            }

            if (!isInCart(item.id)) {
                addToCart(item);
                return true;
            }
            return false; // Already in cart
        },
        [addToCart, isInCart]
    );

    return { addToCart: handleAddToCart, isInCart };
}

/**
 * useRemoveFromCart hook
 * ใช้สำหรับลบรายการออกจาก cart
 */
export function useRemoveFromCart() {
    const { removeFromCart } = useCart();

    const handleRemove = useCallback(
        (id: number) => {
            removeFromCart(id);
        },
        [removeFromCart]
    );

    return { removeFromCart: handleRemove };
}

/**
 * useCartItemStatus hook
 * ใช้สำหรับเช็คว่า item อยู่ใน cart หรือไม่
 */
export function useCartItemStatus(itemId: number): {
    isInCart: boolean;
    item: CartItem | undefined;
} {
    const { items, isInCart } = useCart();

    const item = useMemo(
        () => items.find((i) => i.id === itemId),
        [items, itemId]
    );

    return {
        isInCart: isInCart(itemId),
        item,
    };
}

/**
 * useClearCart hook
 * ใช้สำหรับล้างตะกร้า
 */
export function useClearCart() {
    const { clearCart, items } = useCart();

    const handleClear = useCallback(() => {
        if (items.length > 0) {
            clearCart();
        }
    }, [clearCart, items.length]);

    return { clearCart: handleClear, hasItems: items.length > 0 };
}

/**
 * useCartSummary hook
 * ใช้สำหรับหน้า checkout summary
 */
export function useCartSummary() {
    const { items, cartCount, cartTotal, totalOriginalPrice, totalDiscount } = useCart();

    return useMemo(
        () => ({
            items,
            itemCount: cartCount,
            subtotal: totalOriginalPrice,
            discount: totalDiscount,
            total: cartTotal,
            isEmpty: cartCount === 0,
        }),
        [items, cartCount, cartTotal, totalOriginalPrice, totalDiscount]
    );
}
