import React from 'react';
import MarqueeOne from '@/components/common/MarqueeOne';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { ForgotPasswordArea } from '@/features/auth';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "ลืมรหัสผ่าน - Pharmacy Academy",
    description: "รีเซ็ตรหัสผ่านเพื่อเข้าสู่ระบบ",
};

const ForgotPasswordPage = () => {
    return (
        <>
            <MarqueeOne />
            <HeaderTwo />
            <ForgotPasswordArea />
            <FooterTwo />
        </>
    );
};

export default ForgotPasswordPage;
