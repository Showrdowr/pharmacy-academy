import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
    get: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
    api: {
        get: apiMocks.get,
    },
    toApiError: vi.fn((response, fallbackMessage) => new Error(response.message || fallbackMessage)),
}));

import { coursesService } from './coursesApi';

describe('coursesService.getCourses', () => {
    beforeEach(() => {
        apiMocks.get.mockReset();
    });

    it('normalizes legacy array payloads from the public courses endpoint', async () => {
        apiMocks.get.mockResolvedValue({
            success: true,
            data: [
                {
                    id: 139,
                    title: 'Simplifying T2DM Management with DPP4i',
                    audience: 'all',
                    price: 0,
                },
            ],
        });

        const result = await coursesService.getCourses({ limit: 12 });

        expect(apiMocks.get).toHaveBeenCalledWith('/public/courses?limit=12');
        expect(result).toEqual({
            courses: [
                expect.objectContaining({
                    id: 139,
                    title: 'Simplifying T2DM Management with DPP4i',
                    audience: 'all',
                }),
            ],
            total: 1,
            page: 1,
            limit: 1,
            hasMore: false,
        });
    });

    it('uses categoryId when requesting filtered public courses', async () => {
        apiMocks.get.mockResolvedValue({
            success: true,
            data: {
                courses: [],
                total: 0,
                page: 1,
                limit: 12,
                hasMore: false,
            },
        });

        await coursesService.getCourses({
            category: 'general',
            limit: 12,
        });

        expect(apiMocks.get).toHaveBeenCalledWith('/public/courses?categoryId=general&limit=12');
    });
});
