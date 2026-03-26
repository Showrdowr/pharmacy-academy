// API Service Layer
// Shared API client configuration for making HTTP requests

import { API_BASE_URL } from '@/config';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    statusCode?: number;
    code?: string;
    details?: unknown;
}

export class ApiError extends Error {
    statusCode: number;
    code?: string;
    details?: unknown;

    constructor(message: string, options?: { statusCode?: number; code?: string; details?: unknown }) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = options?.statusCode || 500;
        this.code = options?.code;
        this.details = options?.details;
    }
}

export function toApiError<T>(response: ApiResponse<T>, fallbackMessage: string) {
    return new ApiError(response.message || fallbackMessage, {
        statusCode: response.statusCode,
        code: response.code,
        details: response.details,
    });
}

function parseResponseBody(rawBody: string) {
    if (!rawBody) {
        return null;
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        return rawBody;
    }
}

function buildRequestBody(body: unknown): BodyInit | undefined {
    if (body === undefined) {
        return undefined;
    }

    if (body instanceof FormData || typeof body === 'string' || body instanceof Blob) {
        return body;
    }

    return JSON.stringify(body);
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

        const headers = new Headers(fetchOptions.headers);
        const hasBody = fetchOptions.body !== undefined;

        if (hasBody && !(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (!hasBody && headers.has('Content-Type')) {
            headers.delete('Content-Type');
        }

        // Add auth token if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                credentials: 'include', // Ensure cookies are sent
            });

            const rawBody = await response.text();
            const data = parseResponseBody(rawBody);

            if (!response.ok) {
                const message = typeof data === 'object' && data !== null
                    ? (data as { message?: string; error?: string }).message
                        || (data as { message?: string; error?: string }).error
                        || 'API request failed'
                    : rawBody || 'API request failed';

                return {
                    data: null as T,
                    success: false,
                    message,
                    statusCode: response.status,
                    code: typeof data === 'object' && data !== null ? (data as { code?: string }).code : undefined,
                    details: typeof data === 'object' && data !== null ? (data as { details?: unknown }).details : undefined,
                };
            }

            return {
                data: typeof data === 'object' && data !== null && 'data' in data
                    ? (data as { data: T }).data
                    : data as T,
                success: true,
            };
        } catch (error) {
            const apiError = error instanceof ApiError
                ? error
                : new ApiError(error instanceof Error ? error.message : 'Unknown error');

            return {
                data: null as T,
                success: false,
                message: apiError.message,
                statusCode: apiError.statusCode,
                code: apiError.code,
                details: apiError.details,
            };
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'GET', params });
    }

    async post<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body' | 'params'> = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: buildRequestBody(body),
        });
    }

    async put<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body' | 'params'> = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: buildRequestBody(body),
        });
    }

    async patch<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body' | 'params'> = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: buildRequestBody(body),
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
