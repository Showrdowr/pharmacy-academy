"use client";

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { authService } from '../services/authApi';

interface TextCaptchaModalProps {
    onSuccess: (answer: string, token: string) => void;
    onClose: () => void;
}

export const TextCaptchaModal: React.FC<TextCaptchaModalProps> = ({ onSuccess, onClose }) => {
    const t = useTranslations('auth.captcha');
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCaptcha = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authService.fetchCaptcha();
            if (res.success && res.svg && res.token) {
                setCaptchaSvg(res.svg);
                setCaptchaToken(res.token);
                setCaptchaAnswer('');
            } else {
                setError(t('loadFailed'));
            }
        } catch (err) {
            setError(t('loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!captchaAnswer.trim()) {
            setError(t('answerRequired'));
            return;
        }
        onSuccess(captchaAnswer, captchaToken);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>
                    {t('title')}
                </h3>
                <p style={{ color: '#000000', fontSize: '14px', marginBottom: '24px' }}>
                    {t('description')}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        marginBottom: '16px' 
                    }}>
                        <div style={{ 
                            flex: 1, 
                            height: '60px', 
                            backgroundColor: '#F3F4F6', 
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E5E7EB',
                            position: 'relative'
                        }}>
                            {isLoading ? (
                                <Loader2 className="animate-spin text-blue-500" size={24} />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: captchaSvg }} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={fetchCaptcha}
                            disabled={isLoading}
                            style={{
                                padding: '12px',
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                color: '#6B7280',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            title={t('refreshTitle')}
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <input
                            autoFocus
                            type="text"
                            value={captchaAnswer}
                            onChange={(e) => {
                                setCaptchaAnswer(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder={t('inputPlaceholder')}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                backgroundColor: error ? '#FEF2F2' : '#F9FAFB',
                                border: `2px solid ${error ? '#EF4444' : '#E5E7EB'}`,
                                borderRadius: '12px',
                                outline: 'none',
                                fontSize: '16px',
                                color: '#000000',
                                transition: 'all 0.2s'
                            }}
                        />
                        {error && (
                            <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px',
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                fontWeight: '600',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '12px',
                                backgroundColor: '#2563EB',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {t('confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
