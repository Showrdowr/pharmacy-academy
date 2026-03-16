import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { CheckoutArea } from '@/features/payment';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ชำระเงิน - Pharmacy Academy",
    description: "ชำระเงินสำหรับคอร์สเรียน",
};

const CheckoutPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <CheckoutArea />
            <FooterTwo />
        </>
    );
};

export default CheckoutPage;
