"use client"

import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

const FooterTwo = () => {
    const t = useTranslations('common.footer');

    return (
        <>
            <footer className="footer-section fix footer-bg">
                <div className="big-circle">
                    <img src="/assets/img/footer/big-circle.png" alt="img" />
                </div>
                <div className="circle-shape-2">
                    <img src="/assets/img/footer/circle-2.png" alt="img" />
                </div>
                <div className="Vector-shape-2">
                    <img src="/assets/img/footer/Vector-2.png" alt="img" />
                </div>
                <div className="container">
                    <div className="footer-banner-items">
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div className="footer-banner">
                                    <div className="content">
                                        <h3 className="wow fadeInUp" style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '15px' }}>{t('registerTitle')}</h3>
                                        <p className="wow fadeInUp" data-wow-delay=".3s" style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '25px' }}>{t('registerDescription')}</p>
                                        <Link href="/register" className="theme-btn wow fadeInUp" data-wow-delay=".5s" style={{ fontSize: '20px', padding: '14px 28px', fontWeight: 'bold' }}>
                                            {t('registerCta')}
                                        </Link>
                                    </div>
                                    <div className="thumb">
                                        <img src="/assets/img/boy-img-2.png" alt="img" className="wow fadeInUp" data-wow-delay="0.7s" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="footer-banner style-2">
                                    <div className="content">
                                        <h3 className="wow fadeInUp" style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '15px' }}>{t('startLearningTitle')}</h3>
                                        <p className="wow fadeInUp" data-wow-delay=".3s" style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '25px' }}>{t('startLearningDescription')}</p>
                                        <Link href="/courses-grid" className="theme-btn wow fadeInUp" data-wow-delay=".5s" style={{ fontSize: '20px', padding: '14px 28px', fontWeight: 'bold' }}>
                                            {t('startLearningCta')}
                                        </Link>
                                    </div>
                                    <div className="thumb">
                                        <img src="/assets/img/boy-img-3.png" alt="img" className="wow img-custom-anim-left" data-wow-duration="1.5s" data-wow-delay="0.3s" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-widget-wrapper">
                        <div className="row">
                            <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                                <div className="single-footer-widget">
                                    <div className="widget-head">
                                        <Link href="/">
                                            <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#fff' }}>Pharmacy Academy</span>
                                        </Link>
                                    </div>
                                    <div className="footer-content">
                                        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{t('siteDescription')}</p>
                                        <div className="social-icon">
                                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                                            <a href="#"><i className="fab fa-line"></i></a>
                                            <a href="#"><i className="fab fa-youtube"></i></a>
                                            <a href="#"><i className="fab fa-instagram"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".4s">
                                <div className="single-footer-widget">
                                    <div className="widget-head">
                                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{t('courseCategoriesTitle')}</h3>
                                    </div>
                                    <ul className="list-area" style={{ fontSize: '16px' }}>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category1')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category2')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category3')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category4')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category5')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category6')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('category7')}</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".6s">
                                <div className="single-footer-widget">
                                    <div className="widget-head">
                                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{t('quickLinksTitle')}</h3>
                                    </div>
                                    <ul className="list-area" style={{ fontSize: '16px' }}>
                                        <li style={{ marginBottom: '10px' }}><Link href="/">{t('home')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/courses-grid">{t('allCourses')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="/shop-cart">{t('cart')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="#">{t('aboutUs')}</Link></li>
                                        <li style={{ marginBottom: '10px' }}><Link href="#">{t('faq')}</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".8s">
                                <div className="single-footer-widget">
                                    <div className="widget-head">
                                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{t('contactUsTitle')}</h3>
                                    </div>
                                    <div className="footer-content">
                                        <ul className="contact-info" style={{ fontSize: '16px' }}>
                                            <li>
                                                {t('institute')}
                                                <br />
                                                {t('location')}
                                            </li>
                                            <li>
                                                <a href="mailto:info@pharmacyacademy.com" className="link">info@pharmacyacademy.com</a>
                                            </li>
                                            <li>
                                                <a href="tel:+6621234567">+66 2 123 4567</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom style-2">
                        <p style={{ fontSize: '16px' }}>{t('copyright')} © <Link href="/">Pharmacy Academy</Link></p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default FooterTwo;
