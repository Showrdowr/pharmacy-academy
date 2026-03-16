"use client";

import React from 'react';
import { useLanguage } from '@/features/i18n';

const AboutUsArea = () => {
  const { t } = useLanguage();

  return (
    <section className="about-section py-5">
      <div className="container">
        {/* Mission Section */}
        <div className="row align-items-center mb-5">
          <div className="col-lg-6">
            <div className="about-content">
              <h2 style={{ color: '#004736', marginBottom: '20px' }}>
                <i className="fas fa-graduation-cap me-2"></i>
                {t('พันธกิจของเรา', 'Our Mission')}
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                {t(
                  'Pharmacy Academy มุ่งมั่นที่จะเป็นศูนย์กลางการเรียนรู้ด้านเภสัชศาสตร์ที่ครบวงจร เราเชื่อว่าการศึกษาต่อเนื่องเป็นสิ่งสำคัญสำหรับเภสัชกรทุกคน เพื่อให้สามารถให้บริการด้านสุขภาพที่มีคุณภาพแก่ประชาชน',
                  'Pharmacy Academy is committed to being a comprehensive learning center for pharmaceutical sciences. We believe that continuing education is essential for every pharmacist to provide quality healthcare services to the public.'
                )}
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                {t(
                  'คอร์สเรียนของเราถูกออกแบบโดยผู้เชี่ยวชาญในแต่ละสาขา เพื่อให้ความรู้ที่ทันสมัยและสามารถนำไปประยุกต์ใช้ในการทำงานจริงได้',
                  'Our courses are designed by experts in each field to provide up-to-date knowledge that can be applied in real-world practice.'
                )}
              </p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-image text-center">
              <img
                src="assets/img/about/about-1.png"
                alt={t('เกี่ยวกับ Pharmacy Academy', 'About Pharmacy Academy')}
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
                {t('วิสัยทัศน์', 'Our Vision')}
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                {t(
                  'เราตั้งเป้าหมายที่จะเป็นแพลตฟอร์มการเรียนรู้ออนไลน์ด้านเภสัชศาสตร์อันดับหนึ่งของประเทศไทย โดยมุ่งเน้นการพัฒนาศักยภาพของเภสัชกรในทุกสาขา',
                  'We aim to be the number one online learning platform for pharmaceutical sciences in Thailand, focusing on developing the potential of pharmacists in all fields.'
                )}
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('คอร์สเรียนคุณภาพสูงจากผู้เชี่ยวชาญ', 'High-quality courses from experts')}
                </li>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('เนื้อหาอัพเดทตามหลักวิชาการล่าสุด', 'Content updated with latest academic standards')}
                </li>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('รองรับ CPE สำหรับเภสัชกร', 'CPE support for pharmacists')}
                </li>
                <li style={{ padding: '10px 0', fontSize: '16px', color: '#555' }}>
                  <i className="fas fa-check-circle me-2" style={{ color: '#004736' }}></i>
                  {t('เรียนได้ทุกที่ ทุกเวลา', 'Learn anytime, anywhere')}
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6 order-lg-1">
            <div className="about-image text-center">
              <img
                src="assets/img/about/about-2.png"
                alt={t('วิสัยทัศน์ของเรา', 'Our Vision')}
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
                {t('พร้อมที่จะเริ่มต้นเรียนรู้หรือยัง?', 'Ready to start learning?')}
              </h2>
              <p style={{ marginBottom: '30px', fontSize: '18px' }}>
                {t(
                  'เข้าร่วมกับเภสัชกรกว่า 1,000 คนที่เลือกเรียนกับเรา',
                  'Join over 1,000 pharmacists who choose to learn with us'
                )}
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
                {t('ดูคอร์สเรียนทั้งหมด', 'View All Courses')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsArea;
