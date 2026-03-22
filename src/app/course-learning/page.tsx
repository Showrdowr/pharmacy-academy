"use client";

import React, { Suspense } from 'react';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { CourseLearningArea } from '@/features/learning';

function CourseLearningPageFallback() {
    return (
        <section className="flex min-h-[70vh] items-center justify-center" style={{ background: 'linear-gradient(135deg, #f7faf9 0%, #edf7f4 100%)' }}>
            <div className="text-center">
                <div className="relative mx-auto h-16 w-16">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#004736]" />
                    <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-[#40C7A9]" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">กำลังเตรียมหน้าเรียนวิดีโอ</p>
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
