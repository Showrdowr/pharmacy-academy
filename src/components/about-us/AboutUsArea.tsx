"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

const AboutUsArea = () => {
  const t = useTranslations('common.aboutUs');

  return (
    <section className="about-section py-5">
      <div className="container">
        {/* Mission Section */}
        <div className="row align-items-center mb-5">
          <div className="col-lg-6">
            <div className="about-content">
              <h2 style={{ color: '#004736', marginBottom: '20px' }}>
                <i className="fas fa-graduation-cap me-2"></i>
                {t('missionTitle')}
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                {t('missionDescription1')}
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                {t('missionDescription2')}
              </p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-image text-center">
              <img
                src="/assets/img/about/about-1.png"
                alt={t('missionImageAlt')}
                style={{ maxWidth: '100%', borderRadius: '15px' }}
              />
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="row align-items-center mb-5" style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '15px' }}>
          <div className="col-lg-6 order-lg-2">
            <div className="about-content">
              <h2 style={{ color: '#004736', marginBottom: '20px' }}>
                <i className="fas fa-eye me-2"></i>
                {t('visionTitle')}
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                {t('visionDescription')}
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('visionPoint1')}
                </li>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('visionPoint2')}
                </li>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('visionPoint3')}
                </li>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('visionPoint4')}
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6 order-lg-1">
            <div className="about-image text-center">
              <img
                src="/assets/img/about/about-2.png"
                alt={t('visionImageAlt')}
                style={{ maxWidth: '100%', borderRadius: '15px' }}
              />
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="row">
          <div className="col-12">
            <div style={{
              background: 'linear-gradient(135deg, #004736 0%, #00875a 100%)',
              padding: '50px',
              borderRadius: '20px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ marginBottom: '20px' }}>
                {t('ctaTitle')}
              </h2>
              <p style={{ marginBottom: '30px', fontSize: '18px' }}>
                {t('ctaDescription')}
              </p>
              <a
                href="/courses-grid"
                style={{
                  display: 'inline-block',
                  padding: '15px 40px',
                  backgroundColor: 'white',
                  color: '#004736',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  fontSize: '16px'
                }}
              >
                <i className="fas fa-book-open me-2"></i>
                {t('ctaButton')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsArea;
