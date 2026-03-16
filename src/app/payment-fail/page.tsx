import React, { Suspense } from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentFailArea } from '@/features/payment';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "การชำระเงินไม่สำเร็จ - Pharmacy Academy",
    description: "เกิดข้อผิดพลาดระหว่างการชำระเงิน",
};

const PaymentFailPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <Suspense fallback={<div className="text-center py-5">กำลังโหลด...</div>}>
                <PaymentFailArea />
            </Suspense>
            <FooterTwo />
        </>
    );
};

export default PaymentFailPage;
