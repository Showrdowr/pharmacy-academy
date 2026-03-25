"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Send, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const t = useTranslations("auth.layout");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Left Side - Form Area */}
            <div style={{
                flex: 1,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '24px 20px' : '48px',
                width: isMobile ? '100%' : 'auto',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                }}>
                    {children}
                </div>
            </div>

            {/* Right Side - Decorative Card (Hidden on mobile) */}
            {!isMobile && (
                <div style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 30%, #014D40 70%, #134E4A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative circles */}
                    <div style={{
                        position: 'absolute',
                        top: '-80px',
                        right: '-80px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-60px',
                        left: '-60px',
                        width: '250px',
                        height: '250px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.03)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '30%',
                        left: '10%',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.04)',
                    }} />
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '340px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                    }}>
                        {/* Logo Text */}
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '28px',
                            letterSpacing: '-0.3px',
                        }}>
                            Ontrack Learning
                        </h2>

                        {/* Hero Image */}
                        <div style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '12px',
                            margin: '0 auto 28px',
                            overflow: 'hidden',
                            position: 'relative' // Added for Next.js Image fill support
                        }}>
                            <Image
                                src="/images/ontrack-hero.png"
                                alt="Ontrack Learning"
                                fill
                                style={{
                                    objectFit: 'cover',
                                }}
                                sizes="160px"
                                priority
                            />
                        </div>

                        {/* Description */}
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            marginBottom: '28px',
                        }}>
                            {t('descriptionLine1')}
                            <br />
                            {t('descriptionLine2')}
                        </p>

                        {/* Social Icons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                        }}>
                            {[Facebook, Instagram, Send, Linkedin].map((Icon, index) => (
                                <Link
                                    key={index}
                                    href="#"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                    }}
                                >
                                    <Icon style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthLayout;
