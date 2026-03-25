"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

import AuthLayout from "./AuthLayout";
import { useAuth } from "@/features/auth";

const RegisterArea: React.FC = () => {
    const t = useTranslations('auth.register');
    const router = useRouter();
    const { register, registerPharmacist } = useAuth();
    const [activeTab, setActiveTab] = useState<"general" | "pharmacist">("general");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const includesAny = (source: string, patterns: string[]) => patterns.some((pattern) => source.includes(pattern));

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
            newFieldErrors.firstName = t('fullNameRequired');
        }
        
        if (!formData.email.trim()) {
            newFieldErrors.email = t('emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newFieldErrors.email = t('invalidEmailFormat');
        }

        if (!formData.password) {
            newFieldErrors.password = t('passwordRequired');
        } else if (formData.password.length < 8) {
            newFieldErrors.password = t('passwordTooShort');
        }

        if (formData.password !== formData.confirmPassword) {
            newFieldErrors.confirmPassword = t('passwordsMismatch');
        }

        if (activeTab === "pharmacist" && !formData.licenseNumber.trim()) {
            newFieldErrors.licenseNumber = t('licenseRequired');
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
                const errorMsg = (result.error || "").toLowerCase();
                if (includesAny(errorMsg, ["ชื่อซ้ำ", "name already", "full name already", "name is already", "already used"])) {
                    setFieldErrors({ firstName: t('nameAlreadyUsed') });
                } else if (includesAny(errorMsg, ["อีเมลซ้ำ", "email already", "email is already", "already in use"])) {
                    setFieldErrors({ email: t('emailAlreadyUsed') });
                } else {
                    setError(result.error || t('registrationFailed'));
                }
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError(t('connectionError'));
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
                    {t('title')}
                </h1>
                <p className="text-resp-body-lg" style={{
                    color: '#6B7280',
                }}>
                    {t('subtitle')}
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
                    {t('generalTab')}
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
                    {t('pharmacistTab')}
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
                    <label className="text-resp-body-lg" style={labelStyle}>{t('fullName')}</label>
                    <input
                        type="text"
                        placeholder={t('fullNamePlaceholder')}
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
                    <label className="text-resp-body-lg" style={labelStyle}>{t('email')}</label>
                    <input
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder={t('emailPlaceholder')}
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
                    <label className="text-resp-body-lg" style={labelStyle}>{t('password')}</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('passwordPlaceholder')}
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
                    <label className="text-resp-body-lg" style={labelStyle}>{t('confirmPassword')}</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('confirmPasswordPlaceholder')}
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
                            <label className="text-resp-body-lg" style={labelStyle}>{t('licenseNumber')}</label>
                            <input
                                type="text"
                                placeholder={t('licensePlaceholder')}
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
                    {isSubmitting ? t('submitting') : t('submit')}
                </button>
            </form>

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: '22px' }}>
                <p className="text-resp-body" style={{ color: '#6B7280' }}>
                    {t('alreadyHaveAccount')}{" "}
                    <Link
                        href="/sign-in"
                        style={{
                            color: '#014D40',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                        }}
                        className="text-resp-link"
                    >
                        {t('login')}
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default RegisterArea;
