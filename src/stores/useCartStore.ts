import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartContextType } from '@/features/cart/types';

interface CartStore extends CartContextType {
    setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            cartItems: [],
            isHydrated: false,

            setHasHydrated: (state) => set({ isHydrated: state }),

            addToCart: (item: CartItem) => {
                const { items } = get();
                if (items.some((i) => i.id === item.id)) return;
                const newItems = [...items, item];
                set({
                    items: newItems,
                    cartItems: newItems,
                    cartCount: newItems.length,
                    cartTotal: newItems.reduce((sum, i) => sum + i.price, 0),
                    totalOriginalPrice: newItems.reduce((sum, i) => sum + (i.originalPrice || i.price), 0),
                    totalDiscount: newItems.reduce((sum, i) => sum + (i.originalPrice || i.price), 0) - newItems.reduce((sum, i) => sum + i.price, 0)
                });
            },

            removeFromCart: (id: number) => {
                const { items } = get();
                const newItems = items.filter((item) => item.id !== id);
                set({
                    items: newItems,
                    cartItems: newItems,
                    cartCount: newItems.length,
                    cartTotal: newItems.reduce((sum, i) => sum + i.price, 0),
                    totalOriginalPrice: newItems.reduce((sum, i) => sum + (i.originalPrice || i.price), 0),
                    totalDiscount: newItems.reduce((sum, i) => sum + (i.originalPrice || i.price), 0) - newItems.reduce((sum, i) => sum + i.price, 0)
                });
            },

            clearCart: () => {
                set({
                    items: [],
                    cartItems: [],
                    cartCount: 0,
                    cartTotal: 0,
                    totalOriginalPrice: 0,
                    totalDiscount: 0
                });
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
                if (state) state.setHasHydrated(true);
            }
        }
    )
);
