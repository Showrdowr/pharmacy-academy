import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentSuccessArea } from '@/features/payment';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('payment.meta.success');

    return {
        title: t('title'),
        description: t('description'),
    };
}

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
