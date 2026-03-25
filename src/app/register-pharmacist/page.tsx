import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { RegisterPharmacistArea } from '@/features/auth';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auth.meta.registerPharmacist');

    return {
        title: t('title'),
        description: t('description'),
    };
}

const RegisterPharmacistPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <RegisterPharmacistArea />
            <FooterTwo />
        </>
    );
};

export default RegisterPharmacistPage;
