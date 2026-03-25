import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentPromptPayArea } from '@/features/payment';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('payment.meta.promptPay');

    return {
        title: t('title'),
        description: t('description'),
    };
}

const PaymentPromptPayPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <PaymentPromptPayArea />
            <FooterTwo />
        </>
    );
};

export default PaymentPromptPayPage;
