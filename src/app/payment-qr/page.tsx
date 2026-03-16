import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentQRArea } from '@/features/payment';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ชำระเงินด้วย QR Code - Pharmacy Academy",
    description: "ชำระเงินผ่าน PromptPay QR Code",
};

const PaymentQRPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <PaymentQRArea />
            <FooterTwo />
        </>
    );
};

export default PaymentQRPage;
