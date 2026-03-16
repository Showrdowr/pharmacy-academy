"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, CheckCircle, Loader2, X } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { useLanguage } from '@/features/i18n';
import { authService } from '../services/authApi';
import { TextCaptchaModal } from './TextCaptchaModal';

type Step = 'email' | 'newPassword' | 'success';

const ForgotPasswordArea: React.FC = () => {
    const { t } = useLanguage();
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
            setError(t('กรุณากรอกอีเมล', 'Please enter your email'));
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('รูปแบบอีเมลไม่ถูกต้อง', 'Invalid email format'));
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
            setError(t('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', 'Password must be at least 8 characters'));
            setIsSubmitting(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('รหัสผ่านไม่ตรงกัน', 'Passwords do not match'));
            setIsSubmitting(false);
            return;
        }

        const result = await authService.resetPassword(email, newPassword, captchaAnswer, captchaToken);
        if (result.success) {
            setStep('success');
        } else {
            setError(result.message || t('เกิดข้อผิดพลาด', 'An error occurred'));
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
                    {t('กลับไปหน้าเข้าสู่ระบบ', 'Back to Login')}
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
                            {t('ลืมรหัสผ่าน', 'Forgot Password')}
                        </h1>
                        <p className="text-resp-body-lg" style={{ color: '#6B7280' }}>
                            {t(
                                'กรอกอีเมลของคุณ เราจะส่งรหัส OTP ไปเพื่อรีเซ็ตรหัสผ่าน',
                                'Enter your email and we\'ll send you an OTP to reset your password'
                            )}
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
                                {t('อีเมล', 'Email')}
                            </label>
                            <input
                                type="email"
                                placeholder={t('กรอกอีเมลของคุณ', 'Enter your email')}
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
                                <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> {t('กำลังส่ง...', 'Sending...')}</>
                            ) : (
                                t('ดำเนินการต่อ', 'Continue')
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
                            {t('ตั้งรหัสผ่านใหม่', 'Set New Password')}
                        </h1>
                        <p className="text-resp-body-lg" style={{ color: '#6B7280' }}>
                            {t(
                                'ยืนยันตัวตนสำเร็จแล้ว กรุณาตั้งรหัสผ่านใหม่',
                                'Identity verified! Please set your new password.'
                            )}
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
                            {t('ยืนยัน CAPTCHA แล้ว', 'CAPTCHA Verified')}
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
                                {t('รหัสผ่านใหม่', 'New Password')}
                            </label>
                            <input
                                type="password"
                                placeholder={t('อย่างน้อย 8 ตัวอักษร', 'At least 8 characters')}
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
                                {t('ยืนยันรหัสผ่านใหม่', 'Confirm New Password')}
                            </label>
                            <input
                                type="password"
                                placeholder={t('กรอกรหัสผ่านอีกครั้ง', 'Re-enter your password')}
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
                                <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> {t('กำลังเปลี่ยน...', 'Changing...')}</>
                            ) : (
                                t('เปลี่ยนรหัสผ่าน', 'Reset Password')
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
                        {t('เปลี่ยนรหัสผ่านสำเร็จ!', 'Password Reset Successful!')}
                    </h1>
                    <p className="text-resp-body-lg" style={{
                        color: '#6B7280',
                        marginBottom: '32px',
                    }}>
                        {t(
                            'รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
                            'Your password has been changed. You can now log in with your new password.'
                        )}
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
                        {t('เข้าสู่ระบบ', 'Login')}
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
