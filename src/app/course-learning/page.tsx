"use client";

import React from 'react';
import HeaderTwo from '@/components/layout/headers/HeaderTwo';
import { CourseLearningArea } from '@/features/learning';

const CourseLearningPage = () => {
    return (
        <>
            <HeaderTwo />
            <CourseLearningArea />
        </>
    );
};

export default CourseLearningPage;
