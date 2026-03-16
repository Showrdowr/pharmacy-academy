
import Link from 'next/link';
import React from 'react';

const BreadcrumbAbout = () => {
  return (
    <>
        <section className="breadcrumb-wrapper courses-page-banner">
            <div className="shape-1">
                <img src="assets/img/breadcrumb/shape-1.png" alt="img" />
            </div>
            <div className="shape-2">
                <img src="assets/img/breadcrumb/shape-2.png" alt="img" />
            </div>
            <div className="shape-3">
                <img src="assets/img/breadcrumb/shape-3.png" alt="img" />
            </div>
            <div className="dot-shape">
                <img src="assets/img/breadcrumb/dot-shape.png" alt="img" />
            </div>
            <div className="vector-shape">
                <img src="assets/img/breadcrumb/Vector.png" alt="img" />
            </div>
            <div className="container">
                <div className="row">
                    <div className="page-heading" style={{ textAlign: 'center' }}>
                        <h1 style={{ color: '#f0c050' }}>เกี่ยวกับเรา</h1>
                    </div>
                </div>
            </div>
        </section>
    </>
  );
};

export default BreadcrumbAbout;
