import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { UserProfileArea } from '@/features/profile';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('profile.meta.userProfile');

    return {
        title: t('title'),
        description: t('description'),
        keywords: t('keywords').split(',').map((keyword) => keyword.trim()),
    };
}

const ProfilePage = () => {
    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <UserProfileArea />
            <FooterTwo />
        </Wrapper>
    );
};

export default ProfilePage;
