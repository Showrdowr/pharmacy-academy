import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentHistoryArea } from '@/features/payment';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('payment.meta.history');

    return {
        title: t('title'),
        description: t('description'),
    };
}

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
