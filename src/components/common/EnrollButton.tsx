"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';

interface EnrollButtonProps {
    courseId: number;
    className?: string;
    children?: React.ReactNode;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
    courseId,
    className = "theme-btn yellow-btn",
    children = "สมัครเรียน"
}) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (isLoading) return;

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
            {children}
        </button>
    );
};

export default EnrollButton;
