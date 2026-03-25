"use client";

import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

const CertificateHomeTwo = () => {
  const t = useTranslations('common.home.certificate');
  return (
    <>
      <div className="certificate-text wow fadeInUp text-center" data-wow-delay=".3s">
        <h3 className="text-resp-h2 font-bold mb-6">{t('title')}</h3>
        <Link href="/register" className="theme-btn text-resp-btn">{t('cta')}</Link>
      </div>
    </>
  );
};

export default CertificateHomeTwo;
