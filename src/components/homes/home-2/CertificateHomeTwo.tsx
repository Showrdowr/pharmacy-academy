"use client";

import Link from 'next/link';
import React from 'react';

import { useLanguage } from '@/features/i18n';

const CertificateHomeTwo = () => {
  const { t } = useLanguage();
  return (
    <>
      <div className="certificate-text wow fadeInUp text-center" data-wow-delay=".3s">
        <h3 className="text-resp-h2 font-bold mb-6">{t('รับใบรับรองทักษะคุณภาพของคุณผ่าน Eduspace', 'Get Your Quality Skills Certificate Through Eduspace')}</h3>
        <Link href="/register" className="theme-btn text-resp-btn">{t('เริ่มต้นทันที', 'Get Started Now')}</Link>
      </div>
    </>
  );
};

export default CertificateHomeTwo;