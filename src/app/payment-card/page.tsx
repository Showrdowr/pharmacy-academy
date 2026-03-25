import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentCardArea } from '@/features/payment';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('payment.meta.card');

    return {
        title: t('title'),
        description: t('description'),
    };
}

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
