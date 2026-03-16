/**
 * CourseService
 * Abstraction layer for course data operations
 * Implements DIP (Dependency Inversion Principle) - depend on abstractions, not concretions
 * 
 * Currently: Returns static data
 * Future: Can be extended to fetch from API
 */

import { COURSES_DATA, CATEGORIES, PRICE_RANGES, type Course, type Category, type PriceRange } from '../data/mockData';

export interface ICourseService {
    getAllCourses(): Promise<Course[]>;
    getCourseById(id: number): Promise<Course | undefined>;
    getCategories(): Category[];
    getPriceRanges(): PriceRange[];
    searchCourses(query: string): Promise<Course[]>;
}

class CourseService implements ICourseService {
    async getAllCourses(): Promise<Course[]> {
        // In production, this would be: return await fetch('/api/courses').then(r => r.json());
        return Promise.resolve(COURSES_DATA);
    }

    async getCourseById(id: number): Promise<Course | undefined> {
        // In production, this would be: return await fetch(`/api/courses/${id}`).then(r => r.json());
        return Promise.resolve(COURSES_DATA.find(c => c.id === id));
    }

    getCategories(): Category[] {
        return CATEGORIES;
    }

    getPriceRanges(): PriceRange[] {
        return PRICE_RANGES;
    }

    async searchCourses(query: string): Promise<Course[]> {
        const normalizedQuery = query.toLowerCase();
        const results = COURSES_DATA.filter(course =>
            course.title.toLowerCase().includes(normalizedQuery) ||
            course.titleEn.toLowerCase().includes(normalizedQuery) ||
            course.instructor.toLowerCase().includes(normalizedQuery) ||
            course.category.toLowerCase().includes(normalizedQuery)
        );
        return Promise.resolve(results);
    }
}

// Singleton instance
export const courseService = new CourseService();

export default courseService;
