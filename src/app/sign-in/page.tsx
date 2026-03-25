import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { SignInArea } from '@/features/auth';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('auth.meta.signIn');

    return {
        title: t('title'),
        description: t('description'),
    };
}

const SignInPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <SignInArea />
            <FooterTwo />
        </>
    );
};

export default SignInPage;
