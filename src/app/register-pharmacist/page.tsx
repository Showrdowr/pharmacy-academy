import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { RegisterPharmacistArea } from '@/features/auth';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ลงทะเบียนเภสัชกร - Pharmacy Academy",
    description: "ลงทะเบียนเภสัชกรเพื่อสะสมหน่วยกิต CPE",
};

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
