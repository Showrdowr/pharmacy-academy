"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import AuthLayout from "./AuthLayout";
import { useLanguage } from '@/features/i18n';
import { useAuth } from "@/features/auth";

const RegisterArea: React.FC = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { register, registerPharmacist } = useAuth();
    const [activeTab, setActiveTab] = useState<"general" | "pharmacist">("general");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        licenseNumber: "",
        facilityName: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user types
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setFieldErrors({});

        // Validation logic
        const newFieldErrors: Record<string, string> = {};
        
        if (!formData.firstName.trim()) {
            newFieldErrors.firstName = t('กรุณากรอกชื่อ-นามสกุล', 'Please enter your name');
        }
        
        if (!formData.email.trim()) {
            newFieldErrors.email = t('กรุณากรอกอีเมล', 'Please enter your email');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newFieldErrors.email = t('รูปแบบอีเมลไม่ถูกต้อง', 'Invalid email format');
        }

        if (!formData.password) {
            newFieldErrors.password = t('กรุณากรอกรหัสผ่าน', 'Please enter your password');
        } else if (formData.password.length < 8) {
            newFieldErrors.password = t('รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร', 'Password should be at least 8 characters');
        }

        if (formData.password !== formData.confirmPassword) {
            newFieldErrors.confirmPassword = t('รหัสผ่านไม่ตรงกัน', 'Passwords do not match');
        }

        if (activeTab === "pharmacist" && !formData.licenseNumber.trim()) {
            newFieldErrors.licenseNumber = t('กรุณากรอกเลขที่ใบอนุญาต', 'Please enter your license number');
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            let result;
            if (activeTab === "pharmacist") {
                result = await registerPharmacist({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    professionalLicenseNumber: formData.licenseNumber,
                    acceptTerms: true
                });
            } else {
                result = await register({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    acceptTerms: true
                });
            }

            if (result.success) {
                router.push("/");
            } else {
                const errorMsg = result.error || "";
                if (errorMsg.includes("ชื่อซ้ำ")) {
                    setFieldErrors({ firstName: t('ชื่อนี้ถูกใช้งานแล้ว', 'This name is already in use') });
                } else if (errorMsg.includes("อีเมลซ้ำ")) {
                    setFieldErrors({ email: t('อีเมลนี้ถูกใช้งานแล้ว', 'This email is already in use') });
                } else {
                    setError(errorMsg || t('การลงทะเบียนล้มเหลว', 'Registration failed'));
                }
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError(t('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'Connection error'));
            setIsSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #D1D5DB',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: '#F9FAFB',
        color: '#111827',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '10px',
        fontWeight: 'bold',
        color: '#374151',
    };

    const handleFocus = (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
        if (!fieldErrors[field]) {
            e.target.style.borderColor = '#014D40';
            e.target.style.boxShadow = '0 0 0 3px rgba(1, 77, 64, 0.1)';
        } else {
            e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
        }
    };

    const handleBlur = (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = fieldErrors[field] ? '#DC2626' : '#D1D5DB';
        e.target.style.boxShadow = 'none';
    };

    return (
        <AuthLayout>
            {/* Header */}
            <div style={{ marginBottom: '22px' }}>
                <h1 className="text-resp-h1" style={{
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '8px',
                }}>
                    {t('สมัครสมาชิก', 'Sign Up')}
                </h1>
                <p className="text-resp-body-lg" style={{
                    color: '#6B7280',
                }}>
                    {t('กรอกข้อมูลเพื่อสร้างบัญชีใหม่', 'Fill in your details to create an account')}
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '22px',
                backgroundColor: '#F3F4F6',
                borderRadius: '10px',
                padding: '4px',
                width: '100%',
            }}>
                <button
                    type="button"
                    onClick={() => setActiveTab("general")}
                    style={{
                        flex: 1,
                        padding: '12px 8px',
                        backgroundColor: activeTab === "general" ? '#014D40' : 'transparent',
                        color: activeTab === "general" ? '#ffffff' : '#6B7280',
                        border: 'none',
                        borderRadius: '7px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                    }}
                    className="text-resp-btn"
                >
                    {t('บุคคลทั่วไป', 'General')}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("pharmacist")}
                    style={{
                        flex: 1,
                        padding: '12px 8px',
                        backgroundColor: activeTab === "pharmacist" ? '#014D40' : 'transparent',
                        color: activeTab === "pharmacist" ? '#ffffff' : '#6B7280',
                        border: 'none',
                        borderRadius: '7px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                    }}
                    className="text-resp-btn"
                >
                    {t('เภสัชกร', 'Pharmacist')}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-resp-body" style={{
                    padding: '12px 16px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    marginBottom: '18px',
                    color: '#DC2626',
                }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div style={{ marginBottom: '14px' }}>
                    <label className="text-resp-body-lg" style={labelStyle}>{t('ชื่อ-นามสกุล', 'Name-Last Name')}</label>
                    <input
                        type="text"
                        placeholder={t('ชื่อ-นามสกุล', 'Name-Last Name')}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        style={{
                            ...inputStyle,
                            borderColor: fieldErrors.firstName ? '#DC2626' : '#D1D5DB'
                        }}
                        className="text-resp-body-lg"
                        onFocus={handleFocus('firstName')}
                        onBlur={handleBlur('firstName')}
                    />
                    {fieldErrors.firstName && (
                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                            {fieldErrors.firstName}
                        </span>
                    )}
                </div>

                {/* Email */}
                <div style={{ marginBottom: '14px' }}>
                    <label className="text-resp-body-lg" style={labelStyle}>{t('อีเมล', 'Email')}</label>
                    <input
                        type="email"
                        placeholder={t('กรอกอีเมลของคุณ', 'Enter your email')}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        style={{
                            ...inputStyle,
                            borderColor: fieldErrors.email ? '#DC2626' : '#D1D5DB'
                        }}
                        className="text-resp-body-lg"
                        onFocus={handleFocus('email')}
                        onBlur={handleBlur('email')}
                    />
                    {fieldErrors.email && (
                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                            {fieldErrors.email}
                        </span>
                    )}
                </div>

                {/* Password */}
                <div style={{ marginBottom: '14px' }}>
                    <label className="text-resp-body-lg" style={labelStyle}>{t('รหัสผ่าน', 'Password')}</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('รหัสผ่าน', 'Password')}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            style={{ 
                                ...inputStyle, 
                                paddingRight: '60px',
                                borderColor: fieldErrors.password ? '#DC2626' : '#D1D5DB'
                            }}
                            className="text-resp-body-lg"
                            onFocus={handleFocus('password')}
                            onBlur={handleBlur('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                            }}
                        >
                            {showPassword ?
                                <EyeOff style={{ width: '16px', height: '16px', color: '#6B7280' }} /> :
                                <Eye style={{ width: '16px', height: '16px', color: '#6B7280' }} />
                            }
                        </button>
                    </div>
                    {fieldErrors.password && (
                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                            {fieldErrors.password}
                        </span>
                    )}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '14px' }}>
                    <label className="text-resp-body-lg" style={labelStyle}>{t('ยืนยันรหัสผ่าน', 'Confirm Password')}</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('ยืนยันรหัสผ่าน', 'Confirm password')}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            required
                            style={{ 
                                ...inputStyle, 
                                paddingRight: '60px',
                                borderColor: fieldErrors.confirmPassword ? '#DC2626' : '#D1D5DB'
                            }}
                            className="text-resp-body-lg"
                            onFocus={handleFocus('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                            }}
                        >
                            {showConfirmPassword ?
                                <EyeOff style={{ width: '16px', height: '16px', color: '#6B7280' }} /> :
                                <Eye style={{ width: '16px', height: '16px', color: '#6B7280' }} />
                            }
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                            {fieldErrors.confirmPassword}
                        </span>
                    )}
                </div>

                {/* Pharmacist-only Fields */}
                {activeTab === "pharmacist" && (
                    <>
                        <div style={{ marginBottom: '14px' }}>
                            <label className="text-resp-body-lg" style={labelStyle}>{t('เลขที่ใบอนุญาตประกอบวิชาชีพ', 'Professional License Number')}</label>
                            <input
                                type="text"
                                placeholder={t('เลขที่ใบอนุญาตประกอบวิชาชีพ (ภ.)', 'Professional license number')}
                                value={formData.licenseNumber}
                                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                required
                                style={{
                                    ...inputStyle,
                                    borderColor: fieldErrors.licenseNumber ? '#DC2626' : '#D1D5DB'
                                }}
                                className="text-resp-body-lg"
                                onFocus={handleFocus('licenseNumber')}
                                onBlur={handleBlur('licenseNumber')}
                            />
                            {fieldErrors.licenseNumber && (
                                <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                                    {fieldErrors.licenseNumber}
                                </span>
                            )}
                        </div>
                    </>
                )}

                {/* Sign Up Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginTop: '6px',
                        backgroundColor: '#014D40',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                    }}
                    className="text-resp-btn"
                >
                    {isSubmitting ? t('กำลังสมัครสมาชิก...', 'Signing up...') : t('สมัครสมาชิก', 'Sign Up')}
                </button>
            </form>

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: '22px' }}>
                <p className="text-resp-body" style={{ color: '#6B7280' }}>
                    {t('มีบัญชีอยู่แล้ว?', 'Already have an account?')}{" "}
                    <Link
                        href="/sign-in"
                        style={{
                            color: '#014D40',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                        }}
                        className="text-resp-link"
                    >
                        {t('เข้าสู่ระบบ', 'Login')}
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default RegisterArea;