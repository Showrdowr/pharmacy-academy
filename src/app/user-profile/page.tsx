import React from 'react';
import { Metadata } from 'next';
import Wrapper from '@/components/layout/Wrapper';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { UserProfileArea } from '@/features/profile';

export const metadata: Metadata = {
    title: "โปรไฟล์ของฉัน - Pharmacy Academy",
    description: "ดูข้อมูลโปรไฟล์ คอร์สเรียน และใบ Certificate ของคุณ",
    keywords: "โปรไฟล์, ผู้ใช้, Pharmacy Academy, เภสัชกร, คอร์สเรียน",
};

const UserProfilePage = () => {
    return (
        <Wrapper>
            <MarqueeOne />
            <HeaderTwo />
            <UserProfileArea />
            <FooterTwo />
        </Wrapper>
    );
};

export default UserProfilePage;
