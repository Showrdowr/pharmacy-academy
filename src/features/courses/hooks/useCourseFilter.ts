/**
 * useCourseFilter Hook
 * Encapsulates course filtering logic
 * Extracted from CoursesGridArea.tsx for SOLID SRP compliance
 */

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { filterVisibleCoursesForViewer, getCourseViewerRole } from '../audience';
import { COURSES_DATA, CATEGORIES, PRICE_RANGES, type Course } from '../data/mockData';

interface UseCourseFilterReturn {
    // State
    searchQuery: string;
    selectedCategory: string;
    selectedPriceRange: number;
    isFilterOpen: boolean;
    filteredCourses: Course[];

    // Actions
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (categoryId: string) => void;
    setSelectedPriceRange: (index: number) => void;
    setIsFilterOpen: (open: boolean) => void;
    clearFilters: () => void;

    // Data
    totalCourses: number;
}

interface UseCourseFilterProps {
    initialCourses?: Course[];
}

export const useCourseFilter = ({ initialCourses = COURSES_DATA }: UseCourseFilterProps = {}): UseCourseFilterReturn => {
    const { user, isAuthenticated } = useAuth();
    const viewerRole = getCourseViewerRole(user, isAuthenticated);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const visibleCourses = useMemo(
        () => filterVisibleCoursesForViewer(initialCourses, viewerRole),
        [initialCourses, viewerRole]
    );

    // Set filter closed by default on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setIsFilterOpen(false);
            } else {
                setIsFilterOpen(true);
            }
        };

        // Check on mount
        handleResize();
    }, []);

    // Filter courses based on search, category, and price range
    const filteredCourses = useMemo(() => {
        const priceRange = PRICE_RANGES[selectedPriceRange];
        return visibleCourses.filter((course) => {
            const matchesSearch = searchQuery === '' ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' ||
                course.category === CATEGORIES.find(c => c.id === selectedCategory)?.label;

            const matchesPrice = course.price >= priceRange.min && course.price <= priceRange.max;

            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [searchQuery, selectedCategory, selectedPriceRange, visibleCourses]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedPriceRange(0);
    };

    return {
        // State
        searchQuery,
        selectedCategory,
        selectedPriceRange,
        isFilterOpen,
        filteredCourses,

        // Actions
        setSearchQuery,
        setSelectedCategory,
        setSelectedPriceRange,
        setIsFilterOpen,
        clearFilters,

        // Data
        totalCourses: visibleCourses.length,
    };
};

export default useCourseFilter;
