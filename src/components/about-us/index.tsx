
import React from 'react';
import FooterTwo from '@/components/layout/footers/FooterTwo';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import BreadcrumbAbout from '@/components/common/breadcrumb/BreadcrumbAbout';
import AboutUsArea from './AboutUsArea';
import MarqueeOne from '@/components/common/MarqueeOne';

const AboutUs = () => {
  return (
    <>
      <MarqueeOne />
      <HeaderTwo />
      <BreadcrumbAbout />
      <AboutUsArea />
      <FooterTwo />
    </>
  );
};

export default AboutUs;
