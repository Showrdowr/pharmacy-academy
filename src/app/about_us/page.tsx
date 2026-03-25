
import React from 'react';
import Wrapper from '@/components/layout/Wrapper';
import { AboutUs } from '@/features/about';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('common.meta.about');

    return {
        title: t('title'),
        description: t('description'),
        keywords: t('keywords').split(',').map((keyword) => keyword.trim()),
    };
}

const AboutUsPage = () => {
    return (
        <Wrapper>
            <AboutUs />
        </Wrapper>
    );
};

export default AboutUsPage;
