
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

const BreadcrumbProfile = () => {
  const breadcrumbT = useTranslations('navigation.breadcrumbs');
  const navT = useTranslations('navigation.offCanvas');

  return (
    <>
        <section className="breadcrumb-wrapper courses-page-banner">
            <div className="shape-1">
                <img src="/assets/img/breadcrumb/shape-1.png" alt="img" />
            </div>
            <div className="shape-2">
                <img src="/assets/img/breadcrumb/shape-2.png" alt="img" />
            </div>
            <div className="shape-3">
                <img src="/assets/img/breadcrumb/shape-3.png" alt="img" />
            </div>
            <div className="dot-shape">
                <img src="/assets/img/breadcrumb/dot-shape.png" alt="img" />
            </div>
            <div className="vector-shape">
                <img src="/assets/img/breadcrumb/Vector.png" alt="img" />
            </div>
            <div className="container">
                <div className="row">
                    <div className="page-heading">
                        <h1>{breadcrumbT('profileTitle')}</h1>
                        <ul className="breadcrumb-items">
                            <li><Link href="/">{navT('home')}</Link></li>
                            <li className="style-2">{breadcrumbT('profileCurrent')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </>
  );
};

export default BreadcrumbProfile;
