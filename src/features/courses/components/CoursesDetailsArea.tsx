"use client"
import VideoPopup from '@/components/common/VideoPopup';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';

import { useRouter } from 'next/navigation';
import { useAddToCart } from '@/features/cart/hooks';
import type { CartItem } from '@/features/cart/types';

interface CoursesDetailsAreaProps {
    initialData?: any; // To allow flexibility for Zero UI Breakage Pattern
}

const CoursesDetailsArea: React.FC<CoursesDetailsAreaProps> = ({ initialData }) => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const router = useRouter();
    const { addToCart } = useAddToCart();

    // Mock course data matching the static content
    // In a real app, this would come from props or API
    // Use initialData if provided, otherwise fallback to mock
    const title = initialData?.title || initialData?.titleEn || "Web Development";
    const price = initialData?.price || 1500;
    const instructorName = initialData?.instructor || "Mario S. Davis";
    const coverImage = initialData?.image || "assets/img/courses/details-1.jpg";
    const sidebarImage = initialData?.image || "assets/img/courses/22.jpg";
    const description = initialData?.description || "UX/UI design focuses on creating user-friendly and visually appealing digital experiences...";
    const category = initialData?.category || "Development";

    const courseData: CartItem = {
        id: initialData?.id || 999,
        title: title,
        price: price,
        originalPrice: price + 500, // mock original price
        image: sidebarImage,
        instructor: instructorName,
        rating: initialData?.rating || 4.8,
        category: category,
        credits: initialData?.cpe || 2.5,
        cpe: initialData?.cpe || 2.0
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(courseData);
        // Optional: Show success toast or feedback
    };

    const handleBuyCourse = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(courseData);
        router.push('/checkout');
    };

    return (
        <>

            {/* video modal start */}
            <VideoPopup
                isVideoOpen={isVideoOpen}
                setIsVideoOpen={setIsVideoOpen}
                videoId={"Ml4XCF-JS0k"}
            />
            {/* video modal end */}
            <section className="courses-details-section section-padding pt-0">
                <div className="container">
                    <div className="courses-details-wrapper">
                        <div className="row g-4">
                            <div className="col-lg-8">
                                <div className="courses-details-items">
                                    <div className="courses-image" style={{ position: 'relative', height: '500px', overflow: 'hidden', width: '100%' }}>
                                        <Image
                                            src={coverImage.startsWith('/') ? coverImage : `/${coverImage}`}
                                            alt="cover"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 800px"
                                            priority
                                        />
                                        <a
                                            onClick={() => setIsVideoOpen(true)}
                                            style={{ cursor: "pointer" }}
                                            className="video-btn ripple video-popup">
                                            <i className="fas fa-play"></i>
                                        </a>
                                    </div>
                                    <div className="courses-details-content">
                                        <ul className="nav" role="tablist">
                                            <li className="nav-item wow fadeInUp" data-wow-delay=".3s" role="presentation">
                                                <a href="#Course" data-bs-toggle="tab" className="nav-link active" style={{ fontSize: '30px', fontWeight: 'bold' }} role="tab" aria-selected="true" tabIndex={0}>
                                                    Course Info
                                                </a>
                                            </li>
                                            <li className="nav-item wow fadeInUp" data-wow-delay=".5s" role="presentation">
                                                <a href="#Curriculum" data-bs-toggle="tab" className="nav-link" style={{ fontSize: '30px', fontWeight: 'bold' }} role="tab" aria-selected="false" tabIndex={-1}>
                                                    Curriculum
                                                </a>
                                            </li>
                                            <li className="nav-item wow fadeInUp" data-wow-delay=".5s" role="presentation">
                                                <a href="#Instructors" data-bs-toggle="tab" className="nav-link" style={{ fontSize: '30px', fontWeight: 'bold' }} role="tab" aria-selected="false" tabIndex={-1}>
                                                    Instructors
                                                </a>
                                            </li>
                                            <li className="nav-item wow fadeInUp" data-wow-delay=".5s" role="presentation">
                                                <a href="#Reviews" data-bs-toggle="tab" className="nav-link bb-none" style={{ fontSize: '30px', fontWeight: 'bold' }} role="tab" aria-selected="false" tabIndex={-1}>
                                                    Reviews
                                                </a>
                                            </li>
                                        </ul>
                                        <div className="tab-content">
                                            <div id="Course" className="tab-pane fade show active" role="tabpanel">
                                                <div className="description-content">
                                                    <h3 className="font-bold" style={{ fontSize: '30px' }}>Description</h3>
                                                    <p className="mb-3" style={{ fontSize: '20px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: description }}>
                                                    </p>
                                                    <h3 className="mt-5 font-bold" style={{ fontSize: '30px' }}>What you'll learn in this course?</h3>
                                                    <p className="mb-4" style={{ fontSize: '20px', lineHeight: '1.6' }}>
                                                        Together, UX and UI design ensure that digital products are not only functional and accessible but also engaging and visually coherent, enhancing both usability and overall user satisfaction.
                                                    </p>
                                                    <div className="row g-4 mb-5">
                                                        <div className="col-lg-6">
                                                            <ul className="list-item">
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    <span className="text-force-18">Introduction to UX/UI Design</span>
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    <span className="text-force-18">Design Thinking & User Research</span>
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Wireframing & Prototyping
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Visual Design Principles
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Interaction Design & Usability
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <ul className="list-item">
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    UX Writing & Content Strategy
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Usability Testing & Iteration
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    UI Design Tools
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Mobile & Responsive Design
                                                                </li>
                                                                <li>
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Capstone Project
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <h3>How to Benefits in this Courses</h3>
                                                    <p>
                                                        UI (User Interface) Design is the process of creating the visual elements of product, including layout
                                                        olor schemes, typography, and interactive features like buttons and icons design focuses aesthetics, consistency, and ensuring that the user can easily navigate and interact with the product.
                                                    </p>
                                                </div>
                                            </div>
                                            <div id="Curriculum" className="tab-pane fade" role="tabpanel">
                                                <div className="course-curriculum-items">
                                                    <h3 className="font-bold mb-4" style={{ fontSize: '30px' }}>Course Curriculum</h3>
                                                    <div className="courses-faq-items">
                                                        <div className="accordion" id="accordionExample">
                                                            <div className="accordion-item">
                                                                <h2 className="accordion-header" id="headingOne">
                                                                    <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                                                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                                                        Intro to UX/UI Design
                                                                    </button>
                                                                </h2>
                                                                <div id="collapseOne" className="accordion-collapse collapse show"
                                                                    aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                                    <div className="accordion-body">
                                                                        <ul>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 1 : Introduction to UX/UI Design
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 2 : Design Thinking & User Research
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 3 : Wireframing & Prototyping
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 4 : Visual Design Principles
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="accordion-item">
                                                                <h2 className="accordion-header" id="headingTwo">
                                                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                                                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                                                        Q.  How do I get started with CRM software?
                                                                    </button>
                                                                </h2>
                                                                <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo"
                                                                    data-bs-parent="#accordionExample">
                                                                    <div className="accordion-body">
                                                                        <ul>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 1 : Introduction to UX/UI Design
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 2 : Design Thinking & User Research
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 3 : Wireframing & Prototyping
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 4 : Visual Design Principles
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="accordion-item mb-0">
                                                                <h2 className="accordion-header" id="headingthree">
                                                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                                                        data-bs-target="#collapsethree" aria-expanded="false"
                                                                        aria-controls="collapsethree">
                                                                        Q. Can I customize CRM software my business needs?
                                                                    </button>
                                                                </h2>
                                                                <div id="collapsethree" className="accordion-collapse collapse"
                                                                    aria-labelledby="headingthree" data-bs-parent="#accordionExample">
                                                                    <div className="accordion-body">
                                                                        <ul>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 1 : Introduction to UX/UI Design
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 2 : Design Thinking & User Research
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 3 : Wireframing & Prototyping
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                            <li>
                                                                                <span>
                                                                                    <i className="fas fa-file-alt"></i>
                                                                                    Lesson 4 : Visual Design Principles
                                                                                </span>
                                                                                <span>
                                                                                    <i className="far fa-lock"></i>  (45:00 m)
                                                                                </span>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="Instructors" className="tab-pane fade" role="tabpanel">
                                                <div className="instructors-items">
                                                    <h3>Instructors</h3>
                                                    <div className="instructors-box-items">
                                                        <div className="thumb">
                                                            <img src="assets/img/courses/instructors-1.png" alt="img" />
                                                        </div>
                                                        <div className="content">
                                                            <h4>Norman K. Zapata</h4>
                                                            <span>Lead UX/UI Designer</span>
                                                            <p>
                                                                UX/UI design courses offer a comprehensive introduction to the world of user experience and user interface design
                                                            </p>
                                                            <div className="social-icon">
                                                                <a href="#"><i className="fab fa-facebook-f"></i></a>
                                                                <a href="#"><i className="fab fa-instagram"></i></a>
                                                                <a href="#"><i className="fab fa-dribbble"></i></a>
                                                                <a href="#"><i className="fab fa-behance"></i></a>
                                                                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="instructors-box-items style-2">
                                                        <div className="thumb">
                                                            <img src="assets/img/courses/instructors-2.png" alt="img" />
                                                        </div>
                                                        <div className="content">
                                                            <h4>Ryan M. Carmichael</h4>
                                                            <span>Product Designer</span>
                                                            <p>
                                                                UX/UI design courses offer a comprehensive introduction to the world of user experience and user interface design
                                                            </p>
                                                            <div className="social-icon">
                                                                <a href="#"><i className="fab fa-facebook-f"></i></a>
                                                                <a href="#"><i className="fab fa-instagram"></i></a>
                                                                <a href="#"><i className="fab fa-dribbble"></i></a>
                                                                <a href="#"><i className="fab fa-behance"></i></a>
                                                                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="Reviews" className="tab-pane fade" role="tabpanel">
                                                <div className="courses-reviews-items">
                                                    <h3>Course Reviews</h3>
                                                    <div className="courses-reviews-box-items">
                                                        <div className="courses-reviews-box">
                                                            <div className="reviews-box">
                                                                <h2 className="text-5xl font-bold text-primary mb-2"><span className="count">4.8</span></h2>
                                                                <div className="star">
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                </div>
                                                                <p>856+ Reviews</p>
                                                            </div>
                                                            <div className="reviews-ratting-right">
                                                                <div className="reviews-ratting-item">
                                                                    <div className="star">
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                    </div>
                                                                    <div className="progress">
                                                                        <div className="progress-value style-two"></div>
                                                                    </div>
                                                                    <span>(10)</span>
                                                                </div>
                                                                <div className="reviews-ratting-item">
                                                                    <div className="star">
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                    </div>
                                                                    <div className="progress">
                                                                        <div className="progress-value style-three"></div>
                                                                    </div>
                                                                    <span>(08)</span>
                                                                </div>
                                                                <div className="reviews-ratting-item">
                                                                    <div className="star">
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                    </div>
                                                                    <div className="progress">
                                                                        <div className="progress-value style-three"></div>
                                                                    </div>
                                                                    <span>(08)</span>
                                                                </div>
                                                                <div className="reviews-ratting-item">
                                                                    <div className="star">
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                    </div>
                                                                    <div className="progress">
                                                                        <div className="progress-value style-four"></div>
                                                                    </div>
                                                                    <span>(01)</span>
                                                                </div>
                                                                <div className="reviews-ratting-item">
                                                                    <div className="star">
                                                                        <i className="fas fa-star"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                        <i className="fas fa-star color-2"></i>
                                                                    </div>
                                                                    <div className="progress">
                                                                        <div className="progress-value style-five"></div>
                                                                    </div>
                                                                    <span>(00)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="instructors-box-items">
                                                            <div className="thumb">
                                                                <img src="assets/img/courses/instructors-3.png" alt="img" />
                                                            </div>
                                                            <div className="content">
                                                                <h4>Maria L</h4>
                                                                <span>Junior UX Designer</span>
                                                                <div className="star">
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                    <i className="fas fa-star"></i>
                                                                </div>
                                                                <p>
                                                                    "I enrolled in this UX/UI design course with minimal knowledge the field, and it completely transformed my understanding."
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="courses-sidebar-area sticky-style">
                                    <div className="courses-items">
                                        <div className="courses-image" style={{ position: 'relative', paddingBottom: '60%', overflow: 'hidden' }}>
                                            <Image
                                                src={sidebarImage.startsWith('/') ? sidebarImage : `/${sidebarImage}`}
                                                alt="sidebar cover"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 400px"
                                            />
                                            <h3 className="courses-title">{category}</h3>
                                            <h4 className="topic-title">{title}</h4>
                                            <div className="arrow-items">
                                                <div className="GlidingArrow">
                                                    <img src="assets/img/courses/a1.png" alt="img" />
                                                </div>
                                                <div className="GlidingArrow delay1">
                                                    <img src="assets/img/courses/a2.png" alt="img" />
                                                </div>
                                                <div className="GlidingArrow delay2">
                                                    <img src="assets/img/courses/a3.png" alt="img" />
                                                </div>
                                                <div className="GlidingArrow delay3">
                                                    <img src="assets/img/courses/a4.png" alt="img" />
                                                </div>
                                                <div className="GlidingArrow delay4">
                                                    <img src="assets/img/courses/a5.png" alt="img" />
                                                </div>
                                                <div className="GlidingArrow delay5">
                                                    <img src="assets/img/courses/a6.png" alt="img" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="courses-content">
                                            <h3 className="text-force-bold mb-2" style={{ color: '#014d40', fontSize: '36px' }}>฿{price.toLocaleString()}</h3>
                                            <p style={{ fontSize: '18px' }} dangerouslySetInnerHTML={{ __html: description.substring(0, 100) + '...' }}>
                                            </p>
                                            <div className="courses-btn">
                                                <button onClick={handleAddToCart} className="theme-btn" style={{ fontSize: '22px', width: '100%', padding: '14px', fontWeight: 'bold' }}>Add to Cart</button>
                                                <button onClick={handleBuyCourse} className="theme-btn style-2" style={{ fontSize: '22px', width: '100%', padding: '14px', fontWeight: 'bold' }}>Buy Course</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="courses-category-items">
                                        <h5>Course Includes:</h5>
                                        <ul style={{ fontSize: '18px' }}>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-chalkboard-teacher" style={{ fontSize: '20px' }}></i>
                                                    Instructor
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>{instructorName}</span>
                                            </li>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-user" style={{ fontSize: '20px' }}></i>
                                                    Lesson
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>15</span>
                                            </li>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-clock" style={{ fontSize: '20px' }}></i>
                                                    Duration
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>40h</span>
                                            </li>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-user" style={{ fontSize: '20px' }}></i>
                                                    Students
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>50+</span>
                                            </li>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-globe" style={{ fontSize: '20px' }}></i>
                                                    Language
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>English</span>
                                            </li>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-calendar-alt" style={{ fontSize: '20px' }}></i>
                                                    Deadline
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>15 December 2024</span>
                                            </li>
                                            <li style={{ marginBottom: '12px' }}>
                                                <span>
                                                    <i className="far fa-signal-alt" style={{ fontSize: '20px' }}></i>
                                                    Skill Level
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>All Level</span>
                                            </li>
                                            <li>
                                                <span>
                                                    <i className="fal fa-medal" style={{ fontSize: '20px' }}></i>
                                                    Certifications
                                                </span>
                                                <span className="text" style={{ fontSize: '18px', fontWeight: '500' }}>Yes</span>
                                            </li>
                                        </ul>
                                        <Link href={`/courses/${initialData?.id || ''}`} className="share-btn"><i className="fas fa-share"></i> Share this courses</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CoursesDetailsArea;