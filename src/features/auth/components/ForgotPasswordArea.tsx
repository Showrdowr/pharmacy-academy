"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Mail, KeyRound, CheckCircle, Loader2, X } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { authService } from '../services/authApi';
import { TextCaptchaModal } from './TextCaptchaModal';

type Step = 'email' | 'newPassword' | 'success';

const ForgotPasswordArea: React.FC = () => {
    const t = useTranslations('auth.forgotPassword');
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // CAPTCHA states
    const [showForgotCaptchaModal, setShowForgotCaptchaModal] = useState(false);
    const [captchaAnswer, setCaptchaAnswer] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaVerified, setCaptchaVerified] = useState(false);

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError(t('emailRequired'));
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('invalidEmailFormat'));
            return;
        }

        setShowForgotCaptchaModal(true);
    };

    const handleForgotCaptchaSuccess = (answer: string, token: string) => {
        setShowForgotCaptchaModal(false);
        setCaptchaAnswer(answer);
        setCaptchaToken(token);
        setCaptchaVerified(true);
        setStep('newPassword');
        setError("");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (newPassword.length < 8) {
            setError(t('passwordTooShort'));
            setIsSubmitting(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('passwordsMismatch'));
            setIsSubmitting(false);
            return;
        }

        const result = await authService.resetPassword(email, newPassword, captchaAnswer, captchaToken);
        if (result.success) {
            setStep('success');
        } else {
            setError(result.message || t('genericError'));
        }
        setIsSubmitting(false);
    };

    const inputStyle = (hasError: boolean = false): React.CSSProperties => ({
        width: '100%',
        padding: '16px 20px',
        borderRadius: '12px',
        border: hasError ? '1px solid #DC2626' : '1px solid #D1D5DB',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: '#F9FAFB',
        color: '#111827',
    });

    return (
        <AuthLayout>
            {/* ===== Forgot Password CAPTCHA Modal ===== */}
            {showForgotCaptchaModal && (
                <TextCaptchaModal 
                    onSuccess={handleForgotCaptchaSuccess} 
                    onClose={() => setShowForgotCaptchaModal(false)} 
                />
            )}

            {/* Back Link */}
            <div style={{ marginBottom: '24px' }}>
                <Link
                    href="/sign-in"
                    className="text-resp-link"
                    style={{
                        color: '#014D40',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    <ArrowLeft style={{ width: '18px', height: '18px' }} />
                    {t('backToLogin')}
                </Link>
            </div>

            {/* Step 1: Enter Email */}
            {step === 'email' && (
                <>
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #0D9488, #014D40)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            <Mail style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                        </div>
                        <h1 className="text-resp-h1" style={{
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: '8px',
                        }}>
                            {t('title')}
                        </h1>
                        <p className="text-resp-body-lg" style={{ color: '#6B7280' }}>
                            {t('subtitle')}
                        </p>
                    </div>

                    {error && (
                        <div style={{ color: '#DC2626', fontSize: '14px', marginBottom: '16px', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleForgotPassword} noValidate>
                        <div style={{ marginBottom: '20px' }}>
                            <label className="text-resp-body-lg" style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontWeight: 'bold',
                                color: '#374151',
                            }}>
                                {t('email')}
                            </label>
                            <input
                                type="text"
                                inputMode="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder={t('emailPlaceholder')}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                required
                                style={inputStyle(!!error)}
                                className="text-resp-body-lg"
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#014D40';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#D1D5DB';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#014D40',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                            className="text-resp-btn"
                        >
                            {isSubmitting ? (
                                <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> {t('sending')}</>
                            ) : (
                                t('continue')
                            )}
                        </button>
                    </form>
                </>
            )}

            {/* Step 2: New Password (after CAPTCHA verified) */}
            {step === 'newPassword' && captchaVerified && (
                <>
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #0D9488, #014D40)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            <KeyRound style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                        </div>
                        <h1 className="text-resp-h1" style={{
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: '8px',
                        }}>
                            {t('resetTitle')}
                        </h1>
                        <p className="text-resp-body-lg" style={{ color: '#6B7280' }}>
                            {t('verifiedDescription')}
                        </p>
                        {/* CAPTCHA Verified Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '12px',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            color: '#059669',
                            fontSize: '13px',
                            fontWeight: '600',
                        }}>
                            <CheckCircle style={{ width: '14px', height: '14px' }} />
                            {t('captchaVerified')}
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#DC2626', fontSize: '14px', marginBottom: '16px', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} noValidate>
                        {/* New Password */}
                        <div style={{ marginBottom: '18px' }}>
                            <label className="text-resp-body-lg" style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontWeight: 'bold',
                                color: '#374151',
                            }}>
                                {t('newPassword')}
                            </label>
                            <input
                                type="password"
                                placeholder={t('newPasswordPlaceholder')}
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                                required
                                minLength={8}
                                style={inputStyle()}
                                className="text-resp-body-lg"
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#014D40';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#D1D5DB';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label className="text-resp-body-lg" style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontWeight: 'bold',
                                color: '#374151',
                            }}>
                                {t('confirmNewPassword')}
                            </label>
                            <input
                                type="password"
                                placeholder={t('confirmNewPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                required
                                minLength={8}
                                style={inputStyle()}
                                className="text-resp-body-lg"
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#014D40';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#D1D5DB';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#014D40',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                            className="text-resp-btn"
                        >
                            {isSubmitting ? (
                                <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> {t('changing')}</>
                            ) : (
                                t('resetPassword')
                            )}
                        </button>
                    </form>
                </>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #059669, #10B981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <CheckCircle style={{ width: '36px', height: '36px', color: '#ffffff' }} />
                    </div>
                    <h1 className="text-resp-h1" style={{
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: '12px',
                    }}>
                        {t('successTitle')}
                    </h1>
                    <p className="text-resp-body-lg" style={{
                        color: '#6B7280',
                        marginBottom: '32px',
                    }}>
                        {t('successMessage')}
                    </p>
                    <Link
                        href="/sign-in"
                        style={{
                            display: 'inline-block',
                            padding: '16px 48px',
                            backgroundColor: '#014D40',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                        }}
                        className="text-resp-btn"
                    >
                        {t('login')}
                    </Link>
                </div>
            )}

            {/* CSS Animation for modal */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AuthLayout>
    );
};

export default ForgotPasswordArea;
