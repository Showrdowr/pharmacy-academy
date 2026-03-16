// Auth Types for Pharmacy Academy LMS

/**
 * ประเภทผู้ใช้
 */
export type UserRole = 'general' | 'pharmacist';

/**
 * สถานะการยืนยันตัวตน
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

/**
 * ข้อมูลผู้ใช้
 */
export interface User {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    // สำหรับเภสัชกร
    professionalLicenseNumber?: string;
    pharmacistVerificationStatus?: VerificationStatus;
}

/**
 * ข้อมูลสำหรับ Login
 */
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
    captchaAnswer?: string;
    captchaToken?: string;
}

/**
 * ข้อมูลสำหรับสมัครสมาชิgก (บุคคลทั่วไป)
 */
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    acceptTerms: boolean;
}

/**
 * ข้อมูลสำหรับสมัครสมาชิก (เภสัชกร)
 */
export interface RegisterPharmacistData extends RegisterData {
    professionalLicenseNumber: string;
    graduatedFrom?: string;
    yearsOfExperience?: number;
}

/**
 * Response จาก Auth API
 */
export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
    requiresCaptcha?: boolean;
}

/**
 * State สำหรับ Auth Context
 */
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Actions สำหรับ Auth
 */
export interface AuthActions {
    login: (emailOrCredentials: string | LoginCredentials, password?: string, rememberMe?: boolean) => Promise<AuthResponse>;
    register: (data: RegisterData) => Promise<AuthResponse>;
    registerPharmacist: (data: RegisterPharmacistData) => Promise<AuthResponse>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResponse>;
    forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<AuthResponse>;
}

/**
 * Auth Context Type
 */
export interface AuthContextType extends AuthState, AuthActions { }
