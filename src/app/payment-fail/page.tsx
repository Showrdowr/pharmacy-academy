import React, { Suspense } from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { PaymentFailArea } from '@/features/payment';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('payment.meta.fail');

    return {
        title: t('title'),
        description: t('description'),
    };
}

const PaymentFailPage = async () => {
    const t = await getTranslations('payment.fail');

    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <Suspense fallback={<div className="text-center py-5">{t('loading')}</div>}>
                <PaymentFailArea />
            </Suspense>
            <FooterTwo />
        </>
    );
};

export default PaymentFailPage;
