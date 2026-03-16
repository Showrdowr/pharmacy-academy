// Cart Provider - Legacy Context replaced by Zustand
'use client';

import React, { ReactNode } from 'react';

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    // Zustand store acts universally, so this provider is just a passthrough now.
    return <>{children}</>;
};

export default CartProvider;
