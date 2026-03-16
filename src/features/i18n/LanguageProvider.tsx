"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (thText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('th');
    const [mounted, setMounted] = useState(false);

    // Load language preference from localStorage
    useEffect(() => {
        setMounted(true);
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    // Save language preference to localStorage
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);

        // Update document font class
        document.documentElement.classList.remove('lang-th', 'lang-en');
        document.documentElement.classList.add(`lang-${lang}`);
    };

    const toggleLanguage = () => {
        const newLang = language === 'th' ? 'en' : 'th';
        setLanguage(newLang);
    };

    // Translation helper - returns Thai or English text based on current language
    const t = (thText: string, enText: string): string => {
        return language === 'th' ? thText : enText;
    };

    // Set initial font class
    useEffect(() => {
        if (mounted) {
            document.documentElement.classList.add(`lang-${language}`);
        }
    }, [mounted, language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
