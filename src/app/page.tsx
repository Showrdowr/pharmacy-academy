
import React from 'react';
import Wrapper from '@/components/layout/Wrapper';
import { HomeTwo } from '@/features/home';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('common.meta.home');

    return {
        title: t('title'),
        description: t('description'),
        keywords: t('keywords').split(',').map((keyword) => keyword.trim()),
    };
}

const Home = () => {
    return (
        <Wrapper>
            <HomeTwo />
        </Wrapper>
    );
};

export default Home;
