"use client"
import React from 'react';

export interface CourseSearchResult {
    id: number;
    title: string;
    titleEn: string;
    category: string;
    categoryEn: string;
    instructor: string;
    price: number;
    image: string;
    audience: 'all' | 'general' | 'pharmacist';
}

// All courses data for search suggestions
export const ALL_COURSES: CourseSearchResult[] = [
    {
        id: 1,
        title: 'เภสัชวิทยาคลินิกเบื้องต้น',
        titleEn: 'Clinical Pharmacology Basics',
        category: 'วิทยาลัยเภสัชบำบัด',
        categoryEn: 'Clinical Pharmacy College',
        instructor: 'ภก.สมชาย ใจดี',
        price: 1500,
        image: '/assets/img/courses/01.jpg',
        audience: 'pharmacist',
    },
    {
        id: 2,
        title: 'การบริบาลผู้ป่วยเบาหวาน',
        titleEn: 'Diabetes Patient Care',
        category: 'วิทยาลัยเภสัชกรรมชุมชน',
        categoryEn: 'Community Pharmacy College',
        instructor: 'ภก.วิชัย สุขใจ',
        price: 1800,
        image: '/assets/img/courses/02.jpg',
        audience: 'pharmacist',
    },
    {
        id: 3,
        title: 'กฎหมายเภสัชกรรม',
        titleEn: 'Pharmacy Law',
        category: 'วิทยาลัยการคุ้มครองผู้บริโภคด้านยา',
        categoryEn: 'Consumer Protection College',
        instructor: 'ภก.ประสิทธิ์ นิติกร',
        price: 1200,
        image: '/assets/img/courses/03.jpg',
        audience: 'all',
    },
    {
        id: 4,
        title: 'ยาปฏิชีวนะในทางปฏิบัติ',
        titleEn: 'Antibiotics in Practice',
        category: 'วิทยาลัยแพทย์รวมสมุนไพร',
        categoryEn: 'Herbal Medicine College',
        instructor: 'ภก.สุวรรณา เภสัชกร',
        price: 2000,
        image: '/assets/img/courses/04.jpg',
        audience: 'pharmacist',
    },
    {
        id: 5,
        title: 'การจัดการร้านยา',
        titleEn: 'Pharmacy Management',
        category: 'วิทยาลัยการบริหารเภสัชกิจ',
        categoryEn: 'Pharmacy Administration College',
        instructor: 'ภก.นภา ธุรกิจดี',
        price: 1600,
        image: '/assets/img/courses/05.jpg',
        audience: 'general',
    },
    {
        id: 6,
        title: 'การดูแลผู้ป่วยโรคหัวใจ',
        titleEn: 'Cardiovascular Patient Care',
        category: 'วิทยาลัยเภสัชบำบัด',
        categoryEn: 'Clinical Pharmacy College',
        instructor: 'ภก.ธนวัฒน์ หัวใจดี',
        price: 2500,
        image: '/assets/img/courses/06.jpg',
        audience: 'pharmacist',
    },
    {
        id: 7,
        title: 'เภสัชกรรมโรงพยาบาล',
        titleEn: 'Hospital Pharmacy',
        category: 'วิทยาลัยเภสัชกรรมอุตสาหการ',
        categoryEn: 'Industrial Pharmacy College',
        instructor: 'ภก.สมศักดิ์ โรงพยาบาลดี',
        price: 3500,
        image: '/assets/img/courses/07.jpg',
        audience: 'pharmacist',
    },
    {
        id: 8,
        title: 'พิษวิทยาคลินิก',
        titleEn: 'Clinical Toxicology',
        category: 'วิทยาลัยเภสัชบำบัด',
        categoryEn: 'Clinical Pharmacy College',
        instructor: 'ภก.อรุณ พิษวิทยา',
        price: 4500,
        image: '/assets/img/courses/08.jpg',
        audience: 'pharmacist',
    },
    {
        id: 9,
        title: 'สมุนไพรไทยในยาแผนปัจจุบัน',
        titleEn: 'Thai Herbs in Modern Medicine',
        category: 'วิทยาลัยแพทย์รวมสมุนไพร',
        categoryEn: 'Herbal Medicine College',
        instructor: 'ภก.สมุนไพร รักษ์ธรรมชาติ',
        price: 800,
        image: '/assets/img/courses/09.jpg',
        audience: 'general',
    },
    {
        id: 10,
        title: 'การใช้ยาในผู้สูงอายุ',
        titleEn: 'Geriatric Pharmacotherapy',
        category: 'วิทยาลัยเภสัชกรรมชุมชน',
        categoryEn: 'Community Pharmacy College',
        instructor: 'ภก.วัยวุฒิ ผู้สูงวัย',
        price: 5500,
        image: '/assets/img/courses/10.jpg',
        audience: 'pharmacist',
    },
];

import { useSearchStore } from '@/stores/useSearchStore';

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    // Empty provider for backward compatibility with layout.tsx until it's removed
    return <>{children}</>;
};

export const useSearch = useSearchStore;
