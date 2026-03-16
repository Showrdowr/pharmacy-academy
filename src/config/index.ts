// Application Configuration
// Centralized config for API endpoints and app settings

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const APP_NAME = 'Pharmacy Academy';
export const APP_VERSION = '1.0.0';

// Environment
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

// API Endpoints (will be populated when backend is ready)
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        PROFILE: `${API_BASE_URL}/api/auth/profile`,
    },
    COURSES: {
        LIST: `${API_BASE_URL}/api/courses`,
        DETAIL: (id: string) => `${API_BASE_URL}/api/courses/${id}`,
    },
    PAYMENT: {
        CHECKOUT: `${API_BASE_URL}/api/payment/checkout`,
        HISTORY: `${API_BASE_URL}/api/payment/history`,
    },
};

// Feature Flags
export const FEATURES = {
    ENABLE_CPE: true,
    ENABLE_MULTI_LANGUAGE: true,
};
