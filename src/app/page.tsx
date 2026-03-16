
import React from 'react';
import Wrapper from '@/components/layout/Wrapper';
import { HomeTwo } from '@/features/home';

import { Metadata } from 'next';
export const metadata: Metadata = {
    title: "Eduspace - Online Course & Education Template",
    description: "Online Course, Education & University Next JS Template",
    keywords: "Online Course, Education, University, Next.js",
};

const Home = () => {
    return (
        <Wrapper>
            <HomeTwo />
        </Wrapper>
    );
};

export default Home;
