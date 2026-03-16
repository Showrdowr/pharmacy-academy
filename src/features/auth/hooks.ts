// Auth Hooks - Business logic for authentication
'use client';

import { useContext, useCallback } from 'react';
import { AuthContext } from './AuthProvider';
import type {
    AuthContextType,
    LoginCredentials,
    RegisterData,
    RegisterPharmacistData,
    User
} from './types';

/**
 * useAuth hook
 * ใช้สำหรับเข้าถึง auth state และ actions ทั้งหมด
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * useUser hook
 * ใช้สำหรับเข้าถึงข้อมูล user เท่านั้น
 */
export function useUser(): User | null {
    const { user } = useAuth();
    return user;
}

/**
 * useIsAuthenticated hook
 * ใช้สำหรับเช็คว่า login หรือยัง
 */
export function useIsAuthenticated(): boolean {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
}

/**
 * useIsPharmacist hook
 * ใช้สำหรับเช็คว่าเป็นเภสัชกรหรือไม่
 */
export function useIsPharmacist(): boolean {
    const { user } = useAuth();
    return user?.role === 'pharmacist';
}

/**
 * useRequireAuth hook
 * ใช้สำหรับ redirect ไป sign-in ถ้ายังไม่ login
 */
export function useRequireAuth(redirectUrl = '/sign-in'): {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
} {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Redirect logic should be handled in the component using this hook
    // or use middleware/layout for route protection

    return { isAuthenticated, isLoading, user };
}

/**
 * useLogin hook
 * ใช้สำหรับ login form
 */
export function useLogin() {
    const { login, isLoading, error } = useAuth();

    const handleLogin = useCallback(async (credentials: LoginCredentials) => {
        return login(credentials);
    }, [login]);

    return {
        login: handleLogin,
        isLoading,
        error,
    };
}

/**
 * useRegister hook
 * ใช้สำหรับ register form (บุคคลทั่วไป)
 */
export function useRegister() {
    const { register, isLoading, error } = useAuth();

    const handleRegister = useCallback(async (data: RegisterData) => {
        return register(data);
    }, [register]);

    return {
        register: handleRegister,
        isLoading,
        error,
    };
}

/**
 * useRegisterPharmacist hook
 * ใช้สำหรับ register form (เภสัชกร)
 */
export function useRegisterPharmacist() {
    const { registerPharmacist, isLoading, error } = useAuth();

    const handleRegister = useCallback(async (data: RegisterPharmacistData) => {
        return registerPharmacist(data);
    }, [registerPharmacist]);

    return {
        register: handleRegister,
        isLoading,
        error,
    };
}

/**
 * useLogout hook
 * ใช้สำหรับ logout
 */
export function useLogout() {
    const { logout } = useAuth();

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    return { logout: handleLogout };
}
