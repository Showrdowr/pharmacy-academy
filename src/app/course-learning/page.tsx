"use client";

import React, { Suspense } from 'react';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { CourseLearningArea } from '@/features/learning';

function CourseLearningPageFallback() {
    return (
        <section className="py-16" style={{ background: '#f7faf9', minHeight: '70vh' }}>
            <div className="container text-center">
                <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-[#004736]" />
                <p className="mt-4 text-slate-600">กำลังเตรียมหน้าเรียนวิดีโอ</p>
            </div>
        </section>
    );
}

const CourseLearningPage = () => {
    return (
        <>
            <HeaderTwo />
            <Suspense fallback={<CourseLearningPageFallback />}>
                <CourseLearningArea />
            </Suspense>
        </>
    );
};

export default CourseLearningPage;
