"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, KeyRound, Loader2, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth";
import { authService } from '../services/authApi';

import AuthLayout from "./AuthLayout";
import { TextCaptchaModal } from './TextCaptchaModal';

const SignInArea: React.FC = () => {
    const t = useTranslations('auth.signIn');
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginFailed, setLoginFailed] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [rememberMe, setRememberMe] = useState(false);
    
    // Captcha states
    const [showCaptchaModal, setShowCaptchaModal] = useState(false);

    // Forgot password states (CAPTCHA-based, no OTP)
    const [showForgotCaptchaModal, setShowForgotCaptchaModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [forgotCaptchaAnswer, setForgotCaptchaAnswer] = useState("");
    const [forgotCaptchaToken, setForgotCaptchaToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [forgotError, setForgotError] = useState("");
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const includesAny = (source: string, patterns: string[]) => patterns.some((pattern) => source.includes(pattern));

    // No longer fetching CAPTCHA on mount
    useEffect(() => {
    }, []);

    const handleForgotPassword = () => {
        setFieldErrors({});
        setLoginFailed(false);

        if (!email.trim()) {
            setFieldErrors({ email: t('forgotPasswordEmailRequired') });
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFieldErrors({ email: t('invalidEmailFormat') });
            return;
        }

        // Show CAPTCHA modal for forgot password verification
        setShowForgotCaptchaModal(true);
    };

    const handleForgotCaptchaSuccess = (answer: string, token: string) => {
        setShowForgotCaptchaModal(false);
        setForgotCaptchaAnswer(answer);
        setForgotCaptchaToken(token);
        setShowResetModal(true);
        setNewPassword("");
        setConfirmPassword("");
        setForgotError("");
    };

    const handleResetPassword = async () => {
        setForgotError("");
        if (newPassword.length < 8) {
            setForgotError(t('passwordTooShort'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setForgotError(t('passwordsMismatch'));
            return;
        }
        setForgotSubmitting(true);
        const result = await authService.resetPassword(email, newPassword, forgotCaptchaAnswer, forgotCaptchaToken);
        if (result.success) {
            setShowResetModal(false);
            setResetSuccess(true);
            setTimeout(() => setResetSuccess(false), 5000);
        } else {
            setForgotError(result.message || t('genericError'));
        }
        setForgotSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setLoginFailed(false);
        setIsSubmitting(true);

        // Instead of inline check, we just show the modal
        setShowCaptchaModal(true);
        setIsSubmitting(false);
    };

    const handleCaptchaSuccess = async (answer: string, token: string) => {
        setShowCaptchaModal(false);
        setIsSubmitting(true);

        try {
            const result = await login({
                email, 
                password, 
                captchaAnswer: answer,
                captchaToken: token
            }, undefined, rememberMe);

            if (result.success) {
                // Check if there's a redirect URL stored
                const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
                if (redirectUrl) {
                    sessionStorage.removeItem("redirectAfterLogin");
                    router.push(redirectUrl);
                } else {
                    router.push("/");
                }
            } else {
                setLoginFailed(true);
                const errorMsg = (result.error || '').toLowerCase();
                
                // Handle User Not Found specifically
                if (includesAny(errorMsg, ['not found', 'user not found', 'ไม่พบบัญชี', 'ไม่พบผู้ใช้'])) {
                    setFieldErrors({
                        email: t('accountNotFound')
                    });
                } else if (errorMsg.includes('captcha')) {
                    setFieldErrors({
                        captcha: t('invalidCaptcha')
                    });
                    // Re-open modal on CAPTCHA error
                    setShowCaptchaModal(true);
                } else if (includesAny(errorMsg, ['email', 'user', 'อีเมล'])) {
                    setFieldErrors({
                        email: t('invalidEmail')
                    });
                } else {
                    setFieldErrors({
                        password: t('incorrectPassword')
                    });
                }
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setLoginFailed(true);
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        router.push("/");
    };

    return (
        <AuthLayout>
            {/* ===== Forgot Password CAPTCHA Modal ===== */}
            {showForgotCaptchaModal && (
                <TextCaptchaModal 
                    onSuccess={handleForgotCaptchaSuccess} 
                    onClose={() => setShowForgotCaptchaModal(false)} 
                />
            )}

            {/* ===== Reset Password Modal ===== */}
            {showResetModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px',
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '20px',
                        padding: '40px 32px', width: '100%', maxWidth: '440px',
                        position: 'relative', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                    }}>
                        <button onClick={() => setShowResetModal(false)} style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: '#F3F4F6', border: 'none', borderRadius: '10px',
                            width: '36px', height: '36px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <X style={{ width: '18px', height: '18px', color: '#6B7280' }} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0D9488, #014D40)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <KeyRound style={{ width: '32px', height: '32px', color: '#ffffff' }} />
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                                {t('resetModalTitle')}
                            </h2>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 14px', borderRadius: '8px',
                                backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                                color: '#059669', fontSize: '13px', fontWeight: '600',
                            }}>
                                <CheckCircle style={{ width: '14px', height: '14px' }} />
                                {t('otpVerified')}
                            </div>
                        </div>

                        {forgotError && (
                            <div style={{
                                color: '#DC2626', fontSize: '14px', marginBottom: '16px',
                                textAlign: 'center', fontWeight: '500', padding: '10px 16px',
                                borderRadius: '10px', backgroundColor: '#FEF2F2',
                            }}>{forgotError}</div>
                        )}

                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                                {t('newPassword')}
                            </label>
                            <input type="password" placeholder={t('newPasswordPlaceholder')}
                                value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setForgotError(""); }}
                                style={{
                                    width: '100%', padding: '14px 20px', borderRadius: '12px',
                                    border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#F9FAFB', color: '#111827',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#014D40'; e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                                {t('confirmNewPassword')}
                            </label>
                            <input type="password" placeholder={t('confirmNewPasswordPlaceholder')}
                                value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setForgotError(""); }}
                                style={{
                                    width: '100%', padding: '14px 20px', borderRadius: '12px',
                                    border: '1px solid #D1D5DB', outline: 'none', backgroundColor: '#F9FAFB', color: '#111827',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#014D40'; e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <button onClick={handleResetPassword} disabled={forgotSubmitting} style={{
                            width: '100%', padding: '16px', backgroundColor: '#014D40', color: '#ffffff',
                            border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px',
                            cursor: forgotSubmitting ? 'not-allowed' : 'pointer',
                            opacity: forgotSubmitting ? 0.6 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                        }}>
                            {forgotSubmitting
                                ? <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> {t('changing')}</>
                                : t('resetPassword')
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 className="text-resp-h1" style={{
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '8px',
                }}>
                    {t('title')}
                </h1>
                <p className="text-resp-body-lg" style={{
                    color: '#6B7280',
                }}>
                    {t('subtitle')}
                </p>
            </div>



            {/* Reset Success Banner */}
            {resetSuccess && (
                <div style={{
                    padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
                    backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                    color: '#059669', display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '14px', fontWeight: '600',
                }}>
                    <CheckCircle style={{ width: '20px', height: '20px' }} />
                    {t('resetSuccessBanner')}
                </div>
            )}

            {/* CAPTCHA Modal */}
            {showCaptchaModal && (
                <TextCaptchaModal 
                    onSuccess={handleCaptchaSuccess} 
                    onClose={() => setShowCaptchaModal(false)} 
                />
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={{ marginBottom: '18px' }}>
                    {loginFailed && (
                        <div style={{ color: '#DC2626', fontSize: '22px', marginBottom: '12px', fontWeight: '500' }}>
                            {t('loginFailed')}
                        </div>
                    )}
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
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setLoginFailed(false);
                            if (fieldErrors.email) setFieldErrors(prev => {
                                const next = { ...prev };
                                delete next.email;
                                return next;
                            });
                        }}
                        required
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: fieldErrors.email ? '1px solid #DC2626' : '1px solid #D1D5DB',
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            backgroundColor: '#F9FAFB',
                            color: '#111827',
                        }}
                        className="text-resp-body-lg"
                        onFocus={(e) => {
                            if (!fieldErrors.email) {
                                e.target.style.borderColor = '#014D40';
                                e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)';
                            } else {
                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                            }
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = fieldErrors.email ? '#DC2626' : '#D1D5DB';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    {fieldErrors.email && (
                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                            {fieldErrors.email}
                        </span>
                    )}
                </div>

                {/* Password */}
                <div style={{ marginBottom: '14px' }}>
                    <label className="text-resp-body-lg" style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: 'bold',
                        color: '#374151',
                    }}>
                        {t('password')}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('passwordPlaceholder')}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setLoginFailed(false);
                                if (fieldErrors.password) setFieldErrors(prev => {
                                    const next = { ...prev };
                                    delete next.password;
                                    return next;
                                });
                            }}
                            required
                            style={{
                                width: '100%',
                                padding: '16px 50px 16px 20px',
                                borderRadius: '12px',
                                border: fieldErrors.password ? '1px solid #DC2626' : '1px solid #D1D5DB',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                backgroundColor: '#F9FAFB',
                                color: '#111827',
                            }}
                            className="text-resp-body-lg"
                            onFocus={(e) => {
                                if (!fieldErrors.password) {
                                    e.target.style.borderColor = '#014D40';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)';
                                } else {
                                    e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                                }
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = fieldErrors.password ? '#DC2626' : '#D1D5DB';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {showPassword ? (
                                <EyeOff style={{ width: '18px', height: '18px', color: '#6B7280' }} />
                            ) : (
                                <Eye style={{ width: '18px', height: '18px', color: '#6B7280' }} />
                            )}
                        </button>
                    </div>
                    {fieldErrors.password && (
                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                            {fieldErrors.password}
                        </span>
                    )}
                </div>

                {/* Remember Me + Forgot Password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    {/* Remember Me */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}>
                        <div
                            onClick={() => setRememberMe(!rememberMe)}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '5px',
                                border: rememberMe ? '2px solid #014D40' : '2px solid #D1D5DB',
                                backgroundColor: rememberMe ? '#014D40' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            {rememberMe && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </div>
                        <span className="text-resp-link" style={{ color: '#374151', fontWeight: '500' }}>
                            {t('rememberMe')}
                        </span>
                    </label>

                    {/* Forgot Password */}
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={forgotSubmitting}
                        className="text-resp-link"
                        style={{
                            color: '#014D40',
                            fontWeight: '600',
                            background: 'none',
                            border: 'none',
                            cursor: forgotSubmitting ? 'not-allowed' : 'pointer',
                            padding: 0,
                            textDecoration: 'none',
                        }}
                    >
                        {forgotSubmitting ? t('forgotPasswordSending') : t('forgotPassword')}
                    </button>
                </div>


                {/* Login Button */}
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
                        marginBottom: '24px',
                    }}
                    className="text-resp-btn"
                >
                    {isSubmitting ? t('submitting') : t('submit')}
                </button>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                    <span className="text-resp-info" style={{ color: '#9CA3AF' }}>{t('orLoginWithGoogle')}</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                </div>

                {/* Google Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="text-resp-btn"
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        borderRadius: '10px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t('googleButton')}
                </button>
            </form>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <p className="text-resp-body" style={{ color: '#6B7280' }}>
                    {t('noAccount')}{" "}
                    <Link
                        href="/register"
                        className="text-resp-link"
                        style={{
                            color: '#014D40',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                        }}
                    >
                        {t('signUpHere')}
                    </Link>
                </p>
            </div>

            {/* CSS Animation */}
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AuthLayout>
    );
};

export default SignInArea;
