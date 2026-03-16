"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth";

const HeaderAuthButtons: React.FC = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) {
        return (
            <div className="header-button">
                <span style={{ color: "#666", fontSize: "14px" }}>Loading...</span>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="header-button d-flex align-items-center gap-3">
                <span
                    style={{
                        color: "#014D40",
                        fontSize: "14px",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                    }}
                >
                    สวัสดี, {user.fullName}
                </span>
                <button
                    onClick={logout}
                    className="theme-btn"
                    style={{
                        backgroundColor: "transparent",
                        border: "2px solid #dc2626",
                        color: "#dc2626",
                        padding: "8px 20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc2626";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#dc2626";
                    }}
                >
                    ออกจากระบบ
                </button>
            </div>
        );
    }

    // Not logged in
    return (
        <div className="header-button">
            <Link href="/sign-in" className="theme-btn style-2">
                <i className="far fa-user"></i> เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="theme-btn yellow-btn">
                สมัครสมาชิก
            </Link>
        </div>
    );
};

export default HeaderAuthButtons;
