"use client";

import Link from 'next/link';
import React from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';


const CoursesHomeTwo = () => {
    return (
        <>
            <section className="live-courses-section section-padding">
                <div className="container">
                    <div className="section-title text-center">
                        <h6 className="wow fadeInUp text-base font-semibold uppercase tracking-wider text-primary">
                            คอร์สเรียนสด
                        </h6>
                        <h2 className="wow fadeInUp text-2xl md:text-4xl font-bold mt-2" data-wow-delay=".3s">
                            เรียนรู้แบบ Real-Time <br />
                            กับคอร์สสดออนไลน์
                        </h2>
                    </div>
                    <Swiper
                        spaceBetween={30}
                        speed={1500}
                        loop={true}
                        autoplay={{
                            delay: 1500,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            el: ".dot",
                            clickable: true,
                        }}
                        modules={[Pagination, Autoplay]}
                        breakpoints={{
                            1199: {
                                slidesPerView: 3,
                            },
                            991: {
                                slidesPerView: 2,
                            },
                            767: {
                                slidesPerView: 2,
                            },
                            575: {
                                slidesPerView: 1,
                            },
                            0: {
                                slidesPerView: 1,
                            },
                        }}
                        className="swiper live-courses-slider">

                        <SwiperSlide className="swiper-slide">
                            <div className="live-courses-main-items">
                                <div className="live-courses-items  bg-cover" style={{ background: `url(/assets/img/live-courses/bg-1.jpg)` }}>
                                    <div className="live-courses-content">
                                        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            <span>เภสัชวิทยา</span>
                                            คลินิก
                                        </h3>
                                        <div className="icon">
                                            <img src="assets/img/live-courses/figma.png" alt="img" />
                                        </div>
                                    </div>
                                    <div className="live-courses-image">
                                        <img src="assets/img/live-courses/01.png" alt="img" />
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="client-img bg-cover" style={{ background: `url(/assets/img/live-courses/client-1.png)` }}></div>
                                    <h4 className="text-base md:text-lg font-bold mb-3"><Link href="/courses-details" className="hover:text-primary transition-colors">เภสัชวิทยาคลินิกเบื้องต้น</Link></h4>
                                    <ul className="list">
                                        <li>
                                            <i className="fal fa-user-clock"></i>
                                            ภก.สมชาย
                                        </li>
                                        <li>
                                            <i className="far fa-clock"></i>
                                            3 ชั่วโมง
                                        </li>
                                        <li>
                                            <i className="far fa-user"></i>
                                            2.5 หน่วยกิต
                                        </li>
                                    </ul>
                                    <Link href="/courses-details" className="theme-btn">เข้าร่วมเรียน</Link>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="swiper-slide">
                            <div className="live-courses-main-items">
                                <div className="live-courses-items  bg-cover" style={{ background: `url(/assets/img/live-courses/bg-2.jpg)` }}>
                                    <div className="live-courses-content">
                                        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            <span>การบริบาล</span>
                                            เภสัชกรรม
                                        </h3>
                                        <div className="icon">
                                            <img src="assets/img/live-courses/wp.png" alt="img" />
                                        </div>
                                    </div>
                                    <div className="live-courses-image">
                                        <img src="assets/img/live-courses/02.png" alt="img" />
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="client-img bg-cover" style={{ background: `url(/assets/img/live-courses/client-2.png)` }}></div>
                                    <h4 className="text-base md:text-lg font-bold mb-3"><Link href="/courses-details" className="hover:text-primary transition-colors">การบริบาลเภสัชกรรมผู้ป่วยเบาหวาน</Link></h4>
                                    <ul className="list">
                                        <li>
                                            <i className="fal fa-user-clock"></i>
                                            ภก.วิชัย
                                        </li>
                                        <li>
                                            <i className="far fa-clock"></i>
                                            4 ชั่วโมง
                                        </li>
                                        <li>
                                            <i className="far fa-user"></i>
                                            3.0 หน่วยกิต
                                        </li>
                                    </ul>
                                    <Link href="/courses-details" className="theme-btn">เข้าร่วมเรียน</Link>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="swiper-slide">
                            <div className="live-courses-main-items">
                                <div className="live-courses-items  bg-cover" style={{ background: `url(/assets/img/live-courses/bg-3.jpg)` }}>
                                    <div className="live-courses-content">
                                        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            <span>เภสัชกรรม</span>
                                            ชุมชน
                                        </h3>
                                        <div className="icon">
                                            <img src="assets/img/live-courses/fi.png" alt="img" />
                                        </div>
                                    </div>
                                    <div className="live-courses-image">
                                        <img src="assets/img/live-courses/03.png" alt="img" />
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="client-img bg-cover" style={{ background: `url(/assets/img/live-courses/client-3.png)` }}></div>
                                    <h4 className="text-base md:text-lg font-bold mb-3"><Link href="/courses-details" className="hover:text-primary transition-colors">การให้คำปรึกษาด้านยาในร้านยา</Link></h4>
                                    <ul className="list">
                                        <li>
                                            <i className="fal fa-user-clock"></i>
                                            ภญ.สุดา
                                        </li>
                                        <li>
                                            <i className="far fa-clock"></i>
                                            2 ชั่วโมง
                                        </li>
                                        <li>
                                            <i className="far fa-user"></i>
                                            2.0 หน่วยกิต
                                        </li>
                                    </ul>
                                    <Link href="/courses-details" className="theme-btn">เข้าร่วมเรียน</Link>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="swiper-slide">
                            <div className="live-courses-main-items">
                                <div className="live-courses-items  bg-cover" style={{ background: `url(/assets/img/live-courses/bg-2.jpg)` }}>
                                    <div className="live-courses-content">
                                        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            <span>กฎหมาย</span>
                                            เภสัชกรรม
                                        </h3>
                                        <div className="icon">
                                            <img src="assets/img/live-courses/wp.png" alt="img" />
                                        </div>
                                    </div>
                                    <div className="live-courses-image">
                                        <img src="assets/img/live-courses/02.png" alt="img" />
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="client-img bg-cover" style={{ background: `url(/assets/img/live-courses/client-1.png)` }}></div>
                                    <h4 className="text-base md:text-lg font-bold mb-3"><Link href="/courses-details" className="hover:text-primary transition-colors">พ.ร.บ. ยาและกฎหมายที่เกี่ยวข้อง</Link></h4>
                                    <ul className="list">
                                        <li>
                                            <i className="fal fa-user-clock"></i>
                                            ภก.ประสิทธิ์
                                        </li>
                                        <li>
                                            <i className="far fa-clock"></i>
                                            3 ชั่วโมง
                                        </li>
                                        <li>
                                            <i className="far fa-user"></i>
                                            2.5 หน่วยกิต
                                        </li>
                                    </ul>
                                    <Link href="/courses-details" className="theme-btn">เข้าร่วมเรียน</Link>
                                </div>
                            </div>
                        </SwiperSlide>

                        <div className="swiper-dot text-center pt-5">
                            <div className="dot"></div>
                        </div>
                    </Swiper>
                </div>
            </section>
        </>
    );
};

export default CoursesHomeTwo;