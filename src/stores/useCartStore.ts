import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartContextType } from '@/features/cart/types';

interface CartStore extends CartContextType {
    setHasHydrated: (state: boolean) => void;
    sanitizeCart: () => void;
}

function sanitizeCartItems(items: CartItem[]): CartItem[] {
    return items.filter((item) => Number(item.price) > 0);
}

function buildCartTotals(items: CartItem[]) {
    return {
        items,
        cartItems: items,
        cartCount: items.length,
        cartTotal: items.reduce((sum, i) => sum + i.price, 0),
        totalOriginalPrice: items.reduce((sum, i) => sum + (i.originalPrice || i.price), 0),
        totalDiscount:
            items.reduce((sum, i) => sum + (i.originalPrice || i.price), 0)
            - items.reduce((sum, i) => sum + i.price, 0),
    };
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            cartItems: [],
            isHydrated: false,

            setHasHydrated: (state) => set({ isHydrated: state }),

            sanitizeCart: () => {
                const sanitizedItems = sanitizeCartItems(get().items);
                set(buildCartTotals(sanitizedItems));
            },

            addToCart: (item: CartItem) => {
                if (Number(item.price) <= 0) return;
                const { items } = get();
                if (items.some((i) => i.id === item.id)) return;
                const newItems = sanitizeCartItems([...items, item]);
                set(buildCartTotals(newItems));
            },

            removeFromCart: (id: number) => {
                const { items } = get();
                const newItems = sanitizeCartItems(items.filter((item) => item.id !== id));
                set(buildCartTotals(newItems));
            },

            clearCart: () => {
                set(buildCartTotals([]));
            },

            isInCart: (id: number) => {
                return get().items.some((item) => item.id === id);
            },

            cartCount: 0,
            cartTotal: 0,
            totalOriginalPrice: 0,
            totalDiscount: 0,
        }),
        {
            name: 'pharmacyCart',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.sanitizeCart();
                    state.setHasHydrated(true);
                }
            }
        }
    )
);
