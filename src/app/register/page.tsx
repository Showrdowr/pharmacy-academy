import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { RegisterArea } from '@/features/auth';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auth.meta.register');

    return {
        title: t('title'),
        description: t('description'),
    };
}

const RegisterPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <RegisterArea />
            <FooterTwo />
        </>
    );
};

export default RegisterPage;
