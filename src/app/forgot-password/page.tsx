import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { ForgotPasswordArea } from '@/features/auth';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auth.meta.forgotPassword');

    return {
        title: t('title'),
        description: t('description'),
    };
}

const ForgotPasswordPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <ForgotPasswordArea />
            <FooterTwo />
        </>
    );
};

export default ForgotPasswordPage;
