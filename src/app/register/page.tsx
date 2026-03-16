import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { RegisterArea } from '@/features/auth';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "สมัครสมาชิก - Pharmacy Academy",
    description: "สมัครสมาชิกเพื่อเริ่มเรียนรู้",
};

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
