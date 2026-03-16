// API Service Layer
// Shared API client configuration for making HTTP requests

import { API_BASE_URL } from '@/config';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const { params, ...fetchOptions } = options;

        // Build URL with query params
        let url = `${this.baseURL}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        // Default headers
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        };

        // Add auth token if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                credentials: 'include', // Ensure cookies are sent
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return {
                data,
                success: true,
            };
        } catch (error) {
            return {
                data: null as T,
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'GET', params });
    }

    async post<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export class for custom instances
export { ApiClient };
