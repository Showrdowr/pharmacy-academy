// Features - Main Exports
// ใช้โครงสร้างแบบ Feature-based Architecture

// Re-export each feature as a namespace to avoid naming conflicts
// Usage: import { auth, courses, cart } from '@/features'
// Or: import { useAuth } from '@/features/auth'

export * as auth from './auth';
export * as cart from './cart';
export * as courses from './courses';
export * as learning from './learning';
export * as payment from './payment';
export * as profile from './profile';
export * as i18n from './i18n';
export * as search from './search';
export * as home from './home';
export * as about from './about';

// Common exports that are used frequently (no conflicts)
export { AuthProvider } from './auth';
export { CartProvider } from './cart';
export { LanguageProvider } from './i18n';
export { SearchProvider } from './search';


