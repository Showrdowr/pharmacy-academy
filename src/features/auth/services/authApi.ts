// Auth Service - API calls for authentication
import type {
    LoginCredentials,
    RegisterData,
    RegisterPharmacistData,
    AuthResponse,
    User,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Helper: get the correct storage based on rememberMe preference
function getStorage(): Storage {
    if (typeof window === 'undefined') return localStorage;
    const remember = localStorage.getItem('rememberMe');
    return remember === 'true' ? localStorage : sessionStorage;
}

export const authService = {
    /**
     * Login
     */
    async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthResponse> {
        try {
            console.log('DEBUG: Sending login request to API Proxy:', `/api/auth/login`);
            // Forward login request to Next.js API Route (Proxy) which sets the HttpOnly cookie
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            console.log('DEBUG: Login API RAW response:', { status: response.status, ok: response.ok, data });

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || 'เข้าสู่ระบบล้มเหลว',
                    requiresCaptcha: data.requiresCaptcha || false
                };
            }

            // Save rememberMe preference
            localStorage.setItem('rememberMe', String(rememberMe));
            const storage = rememberMe ? localStorage : sessionStorage;

            if (data.token) {
                // We no longer necessarily need to store the raw token in LS
                // if we are fully migrating to HttpOnly cookies.
                // But for now, we leave ontrack_user and rememberMe alone.
                storage.setItem('ontrack_user', JSON.stringify(data.user));
            }

            return { success: true, user: data.user, token: data.token };
        } catch (error) {
            return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
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
            const response = await fetch(`${API_BASE_URL}/auth/captcha`);
            const data = await response.json();
            if (data.success) {
                return {
                    success: true,
                    svg: data.svg,
                    token: data.token
                };
            }
            return { success: false, error: 'ไม่สามารถดึง CAPTCHA ได้' };
        } catch (error) {
            return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    },

    /**
     * Register (บุคคลทั่วไป)
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
                return { success: false, error: result.message || 'สมัครสมาชิกล้มเหลว' };
            }

            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('ontrack_user', JSON.stringify(result.user));
            }

            return { success: true, user: result.user, token: result.token };
        } catch (error) {
            return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    },

    /**
     * Register (เภสัชกร)
     */
    async registerPharmacist(data: RegisterPharmacistData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
                return { success: false, error: result.message || 'สมัครสมาชิกล้มเหลว' };
            }

            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('ontrack_user', JSON.stringify(result.user));
            }

            return { success: true, user: result.user, token: result.token };
        } catch (error) {
            return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
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
        const storage = getStorage();
        const token = storage.getItem('token') || localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    storage.setItem('ontrack_user', JSON.stringify(data.user));
                    return data.user;
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
        throw new Error('Not implemented');
    },

    /**
     * Change password
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<AuthResponse> {
        throw new Error('Not implemented');
    },

    /**
     * Forgot password - Send reset email
     */
    async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.error || 'เกิดข้อผิดพลาด' };
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    },

    /**
     * Verify OTP code
     */
    async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.error || 'เกิดข้อผิดพลาด' };
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    },

    /**
     * Reset password with token
     */
    async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.error || 'เกิดข้อผิดพลาด' };
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    },

    /**
     * Persist user to localStorage
     */
    persistUser(user: User): void {
        localStorage.setItem('ontrack_user', JSON.stringify(user));
    },
};

export default authService;
