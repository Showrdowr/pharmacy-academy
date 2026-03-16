"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

interface EnrollButtonProps {
    courseId?: string;
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
    courseId,
    className = "theme-btn",
    children = "สมัครเรียน",
    style,
}) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const handleClick = () => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Guest: redirect to login
            router.push("/sign-in");
            return;
        }

        // Logged in: proceed to course or show success
        if (courseId) {
            router.push(`/courses/${courseId}`);
        } else {
            router.push("/courses-grid");
        }
    };

    return (
        <button
            onClick={handleClick}
            className={className}
            style={style}
            disabled={isLoading}
        >
            {isLoading ? "กำลังโหลด..." : children}
        </button>
    );
};

export default EnrollButton;
