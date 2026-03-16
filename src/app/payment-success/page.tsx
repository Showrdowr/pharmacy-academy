import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentSuccessArea } from '@/features/payment';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ชำระเงินสำเร็จ - Pharmacy Academy",
    description: "การชำระเงินสำเร็จแล้ว",
};

const PaymentSuccessPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <PaymentSuccessArea />
            <FooterTwo />
        </>
    );
};

export default PaymentSuccessPage;
