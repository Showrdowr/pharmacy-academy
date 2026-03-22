// Order Store - Zustand store for passing order data across payment pages
// This store persists the current order context so payment pages
// (PromptPay, QR, Card, Success, Fail) can read orderId, total, etc.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderStoreState {
    orderId: string | null;
    orderNumber: string | null;
    orderTotal: number;
    paymentMethod: 'promptpay' | 'card' | null;
    reference: string | null;
    createdAt: string | null;
}

export interface OrderStoreActions {
    setCurrentOrder: (order: {
        orderId: string;
        orderNumber?: string;
        total: number;
        paymentMethod: 'promptpay' | 'card';
        reference?: string;
    }) => void;
    clearCurrentOrder: () => void;
}

export type OrderStore = OrderStoreState & OrderStoreActions;

const initialState: OrderStoreState = {
    orderId: null,
    orderNumber: null,
    orderTotal: 0,
    paymentMethod: null,
    reference: null,
    createdAt: null,
};

export const useOrderStore = create<OrderStore>()(
    persist(
        (set) => ({
            ...initialState,

            setCurrentOrder: (order) =>
                set({
                    orderId: order.orderId,
                    orderNumber: order.orderNumber || order.orderId,
                    orderTotal: order.total,
                    paymentMethod: order.paymentMethod,
                    reference: order.reference || null,
                    createdAt: new Date().toISOString(),
                }),

            clearCurrentOrder: () => set(initialState),
        }),
        {
            name: 'pharmacyOrder',
        },
    ),
);
