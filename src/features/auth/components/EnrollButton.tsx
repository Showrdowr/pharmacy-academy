"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/features/auth";
import { getCourseViewerRole, isCourseRestrictedForViewer } from "@/features/courses/audience";

interface EnrollButtonProps {
    courseId?: string;
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    audience?: 'all' | 'general' | 'pharmacist';
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
    courseId,
    className = "theme-btn",
    children,
    style,
    audience,
}) => {
    const t = useTranslations("auth.enrollButton");
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const viewerRole = getCourseViewerRole(user, isAuthenticated);

    const handleClick = () => {
        if (isLoading) return;

        if (courseId && isCourseRestrictedForViewer(audience, viewerRole)) {
            router.push(`/courses/${courseId}`);
            return;
        }

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
            {isLoading ? t("loading") : children ?? t("defaultLabel")}
        </button>
    );
};

export default EnrollButton;
