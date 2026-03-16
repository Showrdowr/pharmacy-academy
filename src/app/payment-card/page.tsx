import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentCardArea } from '@/features/payment';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ชำระเงินด้วยบัตรเครดิต - Pharmacy Academy",
    description: "ชำระเงินผ่านบัตรเครดิต/เดบิต",
};

const PaymentCardPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <PaymentCardArea />
            <FooterTwo />
        </>
    );
};

export default PaymentCardPage;
