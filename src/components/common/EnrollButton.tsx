"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth';
import { getCourseViewerRole, isCourseRestrictedForViewer } from '@/features/courses/audience';

interface EnrollButtonProps {
    courseId: number;
    className?: string;
    children?: React.ReactNode;
    audience?: 'all' | 'general' | 'pharmacist';
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
    courseId,
    className = "theme-btn yellow-btn",
    children,
    audience,
}) => {
    const t = useTranslations('auth.enrollButton');
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const viewerRole = getCourseViewerRole(user, isAuthenticated);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (isLoading) return;

        if (isCourseRestrictedForViewer(audience, viewerRole)) {
            router.push(`/courses/${courseId}`);
            return;
        }

        if (!isAuthenticated) {
            // Save the intended destination
            sessionStorage.setItem("redirectAfterLogin", `/courses/${courseId}`);
            router.push("/sign-in");
        } else {
            // User is logged in, go to course details or checkout
            router.push(`/courses/${courseId}`);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={className}
            disabled={isLoading}
        >
            {isLoading ? t('loading') : children ?? t('defaultLabel')}
        </button>
    );
};

export default EnrollButton;
