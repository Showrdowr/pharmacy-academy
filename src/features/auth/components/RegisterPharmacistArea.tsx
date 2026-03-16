"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { useLanguage } from '@/features/i18n';

const RegisterPharmacistArea = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { registerPharmacist } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        licenseNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setFieldErrors({});

        // Validation logic
        const newFieldErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) {
            newFieldErrors.name = t('กรุณากรอกชื่อ-นามสกุล', 'Please enter your name');
        }
        
        if (!formData.licenseNumber.trim()) {
            newFieldErrors.licenseNumber = t('กรุณากรอกเลขที่ใบอนุญาต', 'Please enter your license number');
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

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await registerPharmacist({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                professionalLicenseNumber: formData.licenseNumber,
                acceptTerms: true
            });

            if (result.success) {
                router.push("/");
            } else {
                const errorMsg = result.error || "";
                if (errorMsg.includes("ชื่อซ้ำ")) {
                    setFieldErrors({ name: t('ชื่อนี้ถูกใช้งานแล้ว', 'This name is already in use') });
                } else if (errorMsg.includes("อีเมลซ้ำ")) {
                    setFieldErrors({ email: t('อีเมลนี้ถูกใช้งานแล้ว', 'This email is already in use') });
                } else {
                    setError(errorMsg || t('การลงทะเบียนล้มเหลว', 'Registration failed'));
                }
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Pharmacist registration error:", err);
            setError(t('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'Connection error'));
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error for this field
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    return (
        <section className="register-section section-padding">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="register-wrapper" style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '50px 40px',
                            boxShadow: '0 10px 40px rgba(0, 71, 54, 0.1)'
                        }}>
                            <div className="text-center mb-4">
                                <h2 className="text-resp-h2" style={{ color: '#004736', marginBottom: '10px' }}>{t('ลงทะเบียนเภสัชกร', 'Pharmacist Registration')}</h2>
                                <p className="text-resp-body" style={{ color: '#666' }}>{t('สำหรับเภสัชกรที่ต้องการสะสมหน่วยกิต CPE', 'For pharmacists who want to collect CPE credits')}</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger text-resp-body" style={{
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
                                 <div className="mb-4">
                                    <label className="form-label text-resp-body-lg" style={{ color: '#004736', fontWeight: '500' }}>
                                        {t('ชื่อ-นามสกุล', 'Name-Last Name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control text-resp-body-lg"
                                        placeholder={t('กรอกชื่อ-นามสกุล', 'Enter your name')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        style={{
                                            padding: '15px 20px',
                                            borderRadius: '10px',
                                            border: fieldErrors.name ? '1px solid #DC2626' : '1px solid #e0e0e0',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        }}
                                        onFocus={(e) => {
                                            if (fieldErrors.name) {
                                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                                            } else {
                                                e.target.style.borderColor = '#004736';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 54, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = fieldErrors.name ? '#DC2626' : '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    {fieldErrors.name && (
                                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                                            {fieldErrors.name}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-resp-body-lg" style={{ color: '#004736', fontWeight: '500' }}>
                                        {t('เลขที่ใบอนุญาตประกอบวิชาชีพ', 'Professional License Number')}
                                    </label>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        className="form-control text-resp-body-lg"
                                        placeholder={t('กรอกเลขที่ใบอนุญาต ภ.', 'Enter License Number')}
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        style={{
                                            padding: '15px 20px',
                                            borderRadius: '10px',
                                            border: fieldErrors.licenseNumber ? '1px solid #DC2626' : '1px solid #e0e0e0',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        }}
                                        onFocus={(e) => {
                                            if (fieldErrors.licenseNumber) {
                                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                                            } else {
                                                e.target.style.borderColor = '#004736';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 54, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = fieldErrors.licenseNumber ? '#DC2626' : '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    {fieldErrors.licenseNumber && (
                                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                                            {fieldErrors.licenseNumber}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-resp-body-lg" style={{ color: '#004736', fontWeight: '500' }}>
                                        {t('อีเมล', 'Email')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control text-resp-body-lg"
                                        placeholder={t('กรอกอีเมลของคุณ', 'Enter your email')}
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{
                                            padding: '15px 20px',
                                            borderRadius: '10px',
                                            border: fieldErrors.email ? '1px solid #DC2626' : '1px solid #e0e0e0',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        }}
                                        onFocus={(e) => {
                                            if (fieldErrors.email) {
                                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                                            } else {
                                                e.target.style.borderColor = '#004736';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 54, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = fieldErrors.email ? '#DC2626' : '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    {fieldErrors.email && (
                                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                                            {fieldErrors.email}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-resp-body-lg" style={{ color: '#004736', fontWeight: '500' }}>
                                        {t('รหัสผ่าน', 'Password')}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control text-resp-body-lg"
                                        placeholder={t('สร้างรหัสผ่าน', 'Create Password')}
                                        value={formData.password}
                                        onChange={handleChange}
                                        style={{
                                            padding: '15px 20px',
                                            borderRadius: '10px',
                                            border: fieldErrors.password ? '1px solid #DC2626' : '1px solid #e0e0e0',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        }}
                                        onFocus={(e) => {
                                            if (fieldErrors.password) {
                                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                                            } else {
                                                e.target.style.borderColor = '#004736';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 54, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = fieldErrors.password ? '#DC2626' : '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    {fieldErrors.password && (
                                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                                            {fieldErrors.password}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-resp-body-lg" style={{ color: '#004736', fontWeight: '500' }}>
                                        {t('ยืนยันรหัสผ่าน', 'Confirm Password')}
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control text-resp-body-lg"
                                        placeholder={t('ยืนยันรหัสผ่านอีกครั้ง', 'Confirm password again')}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        style={{
                                            padding: '15px 20px',
                                            borderRadius: '10px',
                                            border: fieldErrors.confirmPassword ? '1px solid #DC2626' : '1px solid #e0e0e0',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        }}
                                        onFocus={(e) => {
                                            if (fieldErrors.confirmPassword) {
                                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                                            } else {
                                                e.target.style.borderColor = '#004736';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 54, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = fieldErrors.confirmPassword ? '#DC2626' : '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    {fieldErrors.confirmPassword && (
                                        <span style={{ color: '#DC2626', fontSize: '22px', marginTop: '6px', display: 'block' }}>
                                            {fieldErrors.confirmPassword}
                                        </span>
                                    )}
                                </div>

                                <div className="form-check mb-4">
                                    <input type="checkbox" className="form-check-input" id="terms" required />
                                    <label className="form-check-label text-resp-body" htmlFor="terms" style={{ color: '#666' }}>
                                        {t('ยอมรับ', 'Accept')} <Link href="#" className="text-resp-link" style={{ color: '#004736' }}>{t('เงื่อนไขการใช้งาน', 'Terms of Use')}</Link> {t('และยินยอมให้ตรวจสอบข้อมูลใบอนุญาต', 'and consent to professional license verification')}
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="theme-btn w-100 text-resp-btn"
                                    style={{
                                        padding: '15px',
                                        borderRadius: '10px',
                                        opacity: isSubmitting ? 0.7 : 1,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? t('กำลังลงทะเบียน...', 'Registering...') : t('ลงทะเบียนเภสัชกร', 'Register as Pharmacist')}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p style={{ color: '#666' }}>
                                    {t('มีบัญชีอยู่แล้ว?', 'Already have an account?')} {' '}
                                    <Link href="/sign-in" className="text-resp-link" style={{ color: '#004736', fontWeight: '600' }}>
                                        {t('เข้าสู่ระบบ', 'Login')}
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center mt-3">
                                <p style={{ color: '#666', fontSize: '14px' }}>
                                    {t('ไม่ใช่เภสัชกร?', 'Not a pharmacist?')} {' '}
                                    <Link href="/register" className="text-resp-link" style={{ color: '#004736', fontWeight: '600' }}>
                                        {t('สมัครสมาชิกทั่วไป', 'General Registration')}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegisterPharmacistArea;
