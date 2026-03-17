// Application Configuration
// Centralized config for API endpoints and app settings

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const APP_NAME = 'Pharmacy Academy';
export const APP_VERSION = '1.0.0';

// Environment
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

// Feature Flags
export const FEATURES = {
    ENABLE_CPE: true,
    ENABLE_MULTI_LANGUAGE: true,
};
