
"use client"
import Link from 'next/link';
import Count from '@/components/common/Count';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import VideoPopup from '@/components/common/VideoPopup';


const HeroHomeTwo = () => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const t = useTranslations('common.home.hero');

    return (
        <>
            <section className="hero-section hero-2 fix" style={{ position: 'relative' }}>
                <div className="container">
                    <div className="row g-4">
                        <div className="col-12 col-lg-6">
                            <div className="hero-content">
                                <h1 className="wow fadeInUp text-resp-h1 font-bold mb-4 leading-tight" data-wow-delay=".3s">
                                    {t('titlePrefix')}
                                    <span>{t('titleHighlight')} <img src="/assets/img/hero/bar-shape-2.png" alt="shape-img" /></span>
                                </h1>
                                <p className="wow fadeInUp text-resp-body-lg mb-8 text-gray-600" data-wow-delay=".5s">
                                    {t('description')}
                                </p>
                                <div className="hero-button">
                                    <Link href="/courses-grid" className="theme-btn text-resp-btn wow fadeInUp" data-wow-delay=".3s">
                                        {t('ctaPrimary')}
                                    </Link>
                                    <span className="button-text wow fadeInUp" data-wow-delay=".5s">
                                        <a onClick={() => setIsVideoOpen(true)}
                                            style={{ cursor: "pointer" }}
                                            className="video-btn video-popup">
                                            <i className="fas fa-play"></i>
                                        </a>
                                        <span className="ms-3 d-line">{t('ctaVideo')}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-6">
                            <div className="hero-image-items">
                                <div className="hero-image" style={{ position: 'relative' }}>
                                    <img
                                        src="/assets/img/hero/pharma-hero.png"
                                        alt={t('imageAlt')}
                                        className="wow img-custom-anim-left"
                                        data-wow-duration="1.5s"
                                        data-wow-delay="0.5s"
                                        style={{
                                            borderRadius: '20px',
                                            maxWidth: '100%',
                                            height: 'auto',
                                            boxShadow: '0 20px 60px rgba(0, 71, 54, 0.2)'
                                        }}
                                    />
                                    <div className="hero-shape">
                                        <img src="/assets/img/hero/hero-shape.png" alt="img" className="wow img-custom-anim-top" data-wow-duration="1.5s" data-wow-delay="0.2s" />
                                    </div>
                                    <div className="counter-box">
                                        <p className="text-resp-info">{t('counterPrefix')}</p>
                                        <h2 className="text-resp-h2 font-bold"><span className="odometer" data-count="100">
                                            <Count number={100} text='+' />
                                        </span></h2>
                                        <p className="text-resp-info">{t('counterLabel')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* video modal start */}
            <VideoPopup
                isVideoOpen={isVideoOpen}
                setIsVideoOpen={setIsVideoOpen}
                videoId={"Ml4XCF-JS0k"}
            />
            {/* video modal end */}
        </>
    );
};

export default HeroHomeTwo;
