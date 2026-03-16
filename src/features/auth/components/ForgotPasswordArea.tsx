"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, CheckCircle, Loader2, X, RefreshCw } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { useLanguage } from '@/features/i18n';
import { authService } from '../services/authApi';

type Step = 'email' | 'newPassword' | 'success';

const ForgotPasswordArea: React.FC = () => {
    const { t } = useLanguage();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (!email.trim()) {
            setError(t('กรุณากรอกอีเมล', 'Please enter your email'));
            setIsSubmitting(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('รูปแบบอีเมลไม่ถูกต้อง', 'Invalid email format'));
            setIsSubmitting(false);
            return;
        }

        const result = await authService.forgotPassword(email);
        if (result.success) {
            setShowOtpModal(true);
            setResendCooldown(15);
        } else {
            setError(result.message || t('เกิดข้อผิดพลาด', 'An error occurred'));
        }
        setIsSubmitting(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setOtpError("");

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pasted[i] || "";
        }
        setOtp(newOtp);
        if (pasted.length === 6) {
            otpInputRefs.current[5]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setOtpError(t('กรุณากรอกรหัส OTP 6 หลัก', 'Please enter 6-digit OTP'));
            return;
        }

        setIsSubmitting(true);
        const result = await authService.verifyOtp(email, otpString);
        if (result.success) {
            setOtpVerified(true);
            setShowOtpModal(false);
            setStep('newPassword');
        } else {
            setOtpError(result.message || t('รหัส OTP ไม่ถูกต้อง', 'Invalid OTP'));
        }
        setIsSubmitting(false);
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setOtpError("");
        setIsSubmitting(true);
        const result = await authService.forgotPassword(email);
        if (result.success) {
            setOtp(["", "", "", "", "", ""]);
            setResendCooldown(15);
            setOtpError(t('ส่งรหัส OTP ใหม่แล้ว', 'New OTP sent'));
        } else {
            setOtpError(result.message || t('เกิดข้อผิดพลาด', 'An error occurred'));
        }
        setIsSubmitting(false);
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

        const otpString = otp.join("");
        const result = await authService.resetPassword(email, otpString, newPassword);
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
            {/* OTP Modal */}
            {showOtpModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px',
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        padding: '40px 32px',
                        width: '100%',
                        maxWidth: '440px',
                        position: 'relative',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                        animation: 'fadeInUp 0.3s ease',
                    }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowOtpModal(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: '#F3F4F6',
                                border: 'none',
                                borderRadius: '10px',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                            onMouseOut={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                        >
                            <X style={{ width: '18px', height: '18px', color: '#6B7280' }} />
                        </button>

                        {/* Modal Header */}
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0D9488, #014D40)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <KeyRound style={{ width: '32px', height: '32px', color: '#ffffff' }} />
                            </div>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                                color: '#111827',
                                marginBottom: '8px',
                            }}>
                                {t('ยืนยันรหัส OTP', 'Verify OTP Code')}
                            </h2>
                            <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
                                {t(
                                    `เราส่งรหัส 6 หลักไปที่`,
                                    `We sent a 6-digit code to`
                                )}
                                <br />
                                <strong style={{ color: '#014D40' }}>{email}</strong>
                            </p>
                        </div>

                        {/* OTP Error */}
                        {otpError && (
                            <div style={{
                                color: otpError.includes('ใหม่แล้ว') || otpError.includes('sent') ? '#059669' : '#DC2626',
                                fontSize: '14px',
                                marginBottom: '16px',
                                textAlign: 'center',
                                fontWeight: '500',
                                padding: '10px 16px',
                                borderRadius: '10px',
                                backgroundColor: otpError.includes('ใหม่แล้ว') || otpError.includes('sent') ? '#F0FDF4' : '#FEF2F2',
                            }}>
                                {otpError}
                            </div>
                        )}

                        {/* OTP Input Boxes */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center',
                            marginBottom: '24px',
                        }}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={index === 0 ? handleOtpPaste : undefined}
                                    style={{
                                        width: '52px',
                                        height: '60px',
                                        textAlign: 'center',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        borderRadius: '12px',
                                        border: digit ? '2px solid #014D40' : '2px solid #D1D5DB',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        backgroundColor: digit ? '#F0FDF9' : '#F9FAFB',
                                        color: '#014D40',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#014D40';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = digit ? '#014D40' : '#D1D5DB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerifyOtp}
                            disabled={isSubmitting || otp.join("").length !== 6}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#014D40',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                cursor: (isSubmitting || otp.join("").length !== 6) ? 'not-allowed' : 'pointer',
                                opacity: (isSubmitting || otp.join("").length !== 6) ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '16px',
                            }}
                        >
                            {isSubmitting ? (
                                <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> {t('กำลังตรวจสอบ...', 'Verifying...')}</>
                            ) : (
                                t('ยืนยัน OTP', 'Verify OTP')
                            )}
                        </button>

                        {/* Resend OTP */}
                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isSubmitting || resendCooldown > 0}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: resendCooldown > 0 ? '#9CA3AF' : '#014D40',
                                    fontWeight: '600',
                                    cursor: (isSubmitting || resendCooldown > 0) ? 'not-allowed' : 'pointer',
                                    padding: '8px 16px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    transition: 'color 0.2s',
                                }}
                            >
                                <RefreshCw style={{ width: '16px', height: '16px' }} />
                                {resendCooldown > 0
                                    ? t(`ส่งอีกครั้งใน ${resendCooldown} วินาที`, `Resend in ${resendCooldown}s`)
                                    : t('ส่งรหัส OTP อีกครั้ง', 'Resend OTP')
                                }
                            </button>
                        </div>

                        {/* Timer Info */}
                        <p style={{
                            textAlign: 'center',
                            color: '#9CA3AF',
                            fontSize: '12px',
                            marginTop: '12px',
                        }}>
                            {t('รหัส OTP จะหมดอายุใน 10 นาที', 'OTP expires in 10 minutes')}
                        </p>
                    </div>
                </div>
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

                    <form onSubmit={handleSendOtp} noValidate>
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
                                t('ส่งรหัส OTP', 'Send OTP')
                            )}
                        </button>
                    </form>
                </>
            )}

            {/* Step 2: New Password (after OTP verified) */}
            {step === 'newPassword' && otpVerified && (
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
                                'ยืนยัน OTP สำเร็จแล้ว กรุณาตั้งรหัสผ่านใหม่',
                                'OTP verified! Please set your new password.'
                            )}
                        </p>
                        {/* OTP Verified Badge */}
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
                            {t('OTP ยืนยันแล้ว', 'OTP Verified')}
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
