// Auth Provider - Context Provider for Authentication
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
    AuthContextType,
    User,
    LoginCredentials,
    RegisterData,
    RegisterPharmacistData,
    AuthResponse
} from './types';
import { authService } from './services';

// Create context with undefined default
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider Component
 * Refactored จาก context/AuthContext.tsx เดิม
 * ย้าย business logic ไปอยู่ใน services และ hooks
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check localStorage on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = await authService.getCurrentUser();
                if (storedUser) {
                    setUser(storedUser);
                }
            } catch {
                // Silent fail - user is not logged in
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login - supports both legacy (email, password) and new (credentials) format
    const login = useCallback(async (
        emailOrCredentials: string | LoginCredentials,
        password?: string,
        rememberMe?: boolean
    ): Promise<AuthResponse> => {
        setIsLoading(true);
        setError(null);

        // Normalize to LoginCredentials
        const credentials: LoginCredentials = typeof emailOrCredentials === 'string'
            ? { email: emailOrCredentials, password: password || '' }
            : emailOrCredentials;

        try {
            const response = await authService.login(credentials, rememberMe || false);

            if (response.success && response.user) {
                setUser(response.user);
                authService.persistUser(response.user);
            } else {
                setError(response.error || 'เกิดข้อผิดพลาด');
            }

            return response;
        } catch (err) {
            console.error('DEBUG: AuthProvider.login error:', err);
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Register (บุคคลทั่วไป)
    const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.register(data);

            if (response.success && response.user) {
                setUser(response.user);
                authService.persistUser(response.user);
            } else {
                setError(response.error || 'เกิดข้อผิดพลาด');
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Register (เภสัชกร)
    const registerPharmacist = useCallback(async (data: RegisterPharmacistData): Promise<AuthResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.registerPharmacist(data);

            if (response.success && response.user) {
                setUser(response.user);
                authService.persistUser(response.user);
            } else {
                setError(response.error || 'เกิดข้อผิดพลาด');
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setError(null);
        window.location.href = '/sign-in';
    }, []);

    // Update Profile
    const updateProfile = useCallback(async (data: Partial<User>): Promise<AuthResponse> => {
        setIsLoading(true);

        try {
            const response = await authService.updateProfile(data);

            if (response.success && response.user) {
                setUser(response.user);
            }

            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Change Password
    const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<AuthResponse> => {
        try {
            return await authService.changePassword(oldPassword, newPassword);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
            return { success: false, error: errorMessage };
        }
    }, []);

    // Forgot Password
    const forgotPassword = useCallback(async (email: string) => {
        return authService.forgotPassword(email);
    }, []);

    // Reset Password
    const resetPassword = useCallback(async (email: string, newPassword: string, captchaAnswer: string, captchaToken: string): Promise<AuthResponse> => {
        return authService.resetPassword(email, newPassword, captchaAnswer, captchaToken) as Promise<AuthResponse>;
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        registerPharmacist,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
