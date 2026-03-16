import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentHistoryArea } from '@/features/payment';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ประวัติการชำระเงิน - Pharmacy Academy",
    description: "ดูประวัติการชำระเงินทั้งหมด",
};

const PaymentHistoryPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <PaymentHistoryArea />
            <FooterTwo />
        </>
    );
};

export default PaymentHistoryPage;
