// Auth Service - API calls for authentication
import type {
    LoginCredentials,
    RegisterData,
    RegisterPharmacistData,
    AuthResponse,
    User,
} from '../types';
import { API_BASE_URL } from '@/config';
import { getClientMessage } from '@/features/i18n/runtime';
import { normalizeAuthUser } from '../role';

// Helper: get the correct storage based on rememberMe preference
function getStorage(): Storage {
    if (typeof window === 'undefined') return localStorage;
    const remember = localStorage.getItem('rememberMe');
    return remember === 'true' ? localStorage : sessionStorage;
}

// Helper: get token from whichever storage has it
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return getStorage().getItem('token')
        || localStorage.getItem('token')
        || sessionStorage.getItem('token');
}

export const authService = {
    /**
     * Login
     */
    async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthResponse> {
        try {
            // Forward login request to Next.js API Route (Proxy) which sets the HttpOnly cookie
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || getClientMessage('auth.fallbacks.loginFailed'),
                    requiresCaptcha: data.requiresCaptcha || false
                };
            }

            // Save rememberMe preference
            localStorage.setItem('rememberMe', String(rememberMe));
            const storage = rememberMe ? localStorage : sessionStorage;
            const normalizedUser = normalizeAuthUser(data.user);

            if (data.token && normalizedUser) {
                storage.setItem('token', data.token);
                storage.setItem('ontrack_user', JSON.stringify(normalizedUser));
            }

            return { success: true, user: normalizedUser || undefined, token: data.token };
        } catch (error) {
            return { success: false, error: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Fetch Captcha
     */
    async fetchCaptcha(): Promise<{
        success: boolean;
        svg?: string;
        token?: string;
        error?: string
    }> {
        try {
            const response = await fetch(`/api/auth/captcha`);
            const data = await response.json();
            if (data.success) {
                return {
                    success: true,
                    svg: data.svg,
                    token: data.token
                };
            }
            return { success: false, error: getClientMessage('auth.fallbacks.captchaFetchFailed') };
        } catch (error) {
            return { success: false, error: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Register (บุคคลทั่วไป)
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await fetch(`/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: data.name,
                    email: data.email,
                    password: data.password,
                    role: 'member',
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || getClientMessage('auth.fallbacks.registrationFailed') };
            }
            const normalizedUser = normalizeAuthUser(result.user);

            if (result.token && normalizedUser) {
                const storage = getStorage();
                storage.setItem('token', result.token);
                storage.setItem('ontrack_user', JSON.stringify(normalizedUser));
            }

            return { success: true, user: normalizedUser || undefined, token: result.token };
        } catch (error) {
            return { success: false, error: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Register (เภสัชกร)
     */
    async registerPharmacist(data: RegisterPharmacistData): Promise<AuthResponse> {
        try {
            const response = await fetch(`/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: data.name,
                    email: data.email,
                    password: data.password,
                    role: 'pharmacist',
                    professionalLicenseNumber: data.professionalLicenseNumber,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || getClientMessage('auth.fallbacks.registrationFailed') };
            }
            const normalizedUser = normalizeAuthUser(result.user);

            if (result.token && normalizedUser) {
                const storage = getStorage();
                storage.setItem('token', result.token);
                storage.setItem('ontrack_user', JSON.stringify(normalizedUser));
            }

            return { success: true, user: normalizedUser || undefined, token: result.token };
        } catch (error) {
            return { success: false, error: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Logout
     */
    async logout(): Promise<void> {
        // Clear HttpOnly cookie by hitting the logout proxy route
        try {
            await fetch(`/api/auth/logout`, { method: 'POST' });
        } catch (e) {
            console.error('Failed to logout via proxy API', e);
        }

        localStorage.removeItem('ontrack_user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('ontrack_user');
        sessionStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
    },

    /**
     * Get current user from token
     */
    async getCurrentUser(): Promise<User | null> {
        const token = getToken();
        if (!token) return null;

        try {
            const response = await fetch(`/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    const normalizedUser = normalizeAuthUser(data.user);
                    if (normalizedUser) {
                        getStorage().setItem('ontrack_user', JSON.stringify(normalizedUser));
                    }
                    return normalizedUser;
                }
            } else {
                // Token invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('ontrack_user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('ontrack_user');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }

        return null;
    },

    /**
     * Update profile
     */
    async updateProfile(data: Partial<User>): Promise<AuthResponse> {
        const token = getToken();
        if (!token) return { success: false, error: getClientMessage('auth.fallbacks.signInRequired') };

        try {
            const response = await fetch(`/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.error || getClientMessage('auth.fallbacks.updateProfileFailed') };
            }

            const normalizedUser = normalizeAuthUser(result.user);

            if (normalizedUser) {
                getStorage().setItem('ontrack_user', JSON.stringify(normalizedUser));
            }

            return { success: true, user: normalizedUser || undefined };
        } catch (error) {
            return { success: false, error: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Change password
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<AuthResponse> {
        const token = getToken();
        if (!token) return { success: false, error: getClientMessage('auth.fallbacks.signInRequired') };

        try {
            const response = await fetch(`/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.error || getClientMessage('auth.fallbacks.changePasswordFailed') };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Forgot password - Send reset email
     */
    async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.error || getClientMessage('auth.fallbacks.genericError') };
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Verify OTP code
     */
    async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.error || getClientMessage('auth.fallbacks.genericError') };
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Reset password with token
     */
    async resetPassword(email: string, newPassword: string, captchaAnswer: string, captchaToken: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword, captchaAnswer, captchaToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.error || getClientMessage('auth.fallbacks.genericError') };
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: getClientMessage('auth.fallbacks.connectionError') };
        }
    },

    /**
     * Persist user to localStorage
     */
    persistUser(user: User): void {
        const normalizedUser = normalizeAuthUser(user);
        if (normalizedUser) {
            localStorage.setItem('ontrack_user', JSON.stringify(normalizedUser));
        }
    },
};

export default authService;
