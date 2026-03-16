import { create } from 'zustand';
import { ALL_COURSES, CourseSearchResult } from '@/features/search/SearchProvider';

interface SearchStore {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    selectedPriceRange: string;
    setSelectedPriceRange: (range: string) => void;
    suggestions: CourseSearchResult[];
}

export const useSearchStore = create<SearchStore>((set) => ({
    searchQuery: '',
    showSuggestions: false,
    selectedPriceRange: 'all',
    suggestions: [],

    setSearchQuery: (query: string) => set((state) => {
        const suggestions = query.length >= 2
            ? ALL_COURSES.filter(course =>
                course.title.toLowerCase().includes(query.toLowerCase()) ||
                course.titleEn.toLowerCase().includes(query.toLowerCase()) ||
                course.instructor.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5)
            : [];
        return { searchQuery: query, suggestions };
    }),

    setShowSuggestions: (show: boolean) => set({ showSuggestions: show }),
    setSelectedPriceRange: (range: string) => set({ selectedPriceRange: range }),
}));
