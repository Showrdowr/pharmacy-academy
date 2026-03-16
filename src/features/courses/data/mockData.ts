/**
 * Courses Data Layer
 * Mock data for courses (will be replaced by API calls)
 */

// Type definitions
export interface Course {
    id: number;
    title: string;
    titleEn: string;
    category: string;
    categoryEn: string;
    instructor: string;
    cpe: number;
    price: number;
    level: string;
    rating: number;
    students: number;
    duration: string;
    image: string;
    description: string;
}

export interface Category {
    id: string;
    label: string;
    labelEn: string;
}

export interface PriceRange {
    label: string;
    labelEn: string;
    min: number;
    max: number;
}

// Sample pharmacy courses data
export const COURSES_DATA: Course[] = [
    {
        id: 1,
        title: 'เภสัชวิทยาคลินิกเบื้องต้น',
        titleEn: 'Clinical Pharmacology Basics',
        category: 'เภสัชวิทยา',
        categoryEn: 'Pharmacology',
        instructor: 'ภก.สมชาย ใจดี',
        cpe: 2.5,
        price: 1500,
        level: 'Beginner',
        rating: 4.8,
        students: 245,
        duration: '6 ชั่วโมง',
        image: 'assets/img/courses/01.jpg',
        description: 'เรียนรู้หลักการเภสัชวิทยาคลินิกขั้นพื้นฐาน การออกฤทธิ์ของยา และผลข้างเคียง',
    },
    {
        id: 2,
        title: 'การบริบาลผู้ป่วยเบาหวาน',
        titleEn: 'Diabetes Patient Care',
        category: 'การบริบาลเภสัชกรรม',
        categoryEn: 'Pharmaceutical Care',
        instructor: 'ภก.วิชัย สุขใจ',
        cpe: 3.0,
        price: 1800,
        level: 'Intermediate',
        rating: 4.9,
        students: 189,
        duration: '8 ชั่วโมง',
        image: 'assets/img/courses/02.jpg',
        description: 'แนวทางการดูแลผู้ป่วยเบาหวาน การปรับขนาดยา และการให้คำปรึกษา',
    },
    {
        id: 3,
        title: 'กฎหมายเภสัชกรรม',
        titleEn: 'Pharmacy Law',
        category: 'กฎหมายและจริยธรรม',
        categoryEn: 'Law & Ethics',
        instructor: 'ภก.ประสิทธิ์ นิติกร',
        cpe: 2.0,
        price: 1200,
        level: 'All Level',
        rating: 4.7,
        students: 312,
        duration: '4 ชั่วโมง',
        image: 'assets/img/courses/03.jpg',
        description: 'ความรู้ด้านกฎหมายเภสัชกรรมและจรรยาบรรณวิชาชีพ',
    },
    {
        id: 4,
        title: 'ยาปฏิชีวนะในทางปฏิบัติ',
        titleEn: 'Antibiotics in Practice',
        category: 'เภสัชวิทยา',
        categoryEn: 'Pharmacology',
        instructor: 'ภก.สุวรรณา เภสัชกร',
        cpe: 3.5,
        price: 2000,
        level: 'Intermediate',
        rating: 4.6,
        students: 156,
        duration: '10 ชั่วโมง',
        image: 'assets/img/courses/04.jpg',
        description: 'การเลือกใช้ยาปฏิชีวนะอย่างเหมาะสม และปัญหาเชื้อดื้อยา',
    },
    {
        id: 5,
        title: 'การจัดการร้านยา',
        titleEn: 'Pharmacy Management',
        category: 'บริหารเภสัชกิจ',
        categoryEn: 'Pharmacy Business',
        instructor: 'ภก.นภา ธุรกิจดี',
        cpe: 2.5,
        price: 1600,
        level: 'Beginner',
        rating: 4.5,
        students: 198,
        duration: '5 ชั่วโมง',
        image: 'assets/img/courses/05.jpg',
        description: 'เทคนิคการบริหารจัดการร้านยา สต็อกสินค้า และการบริการ',
    },
];

// Course categories
export const CATEGORIES: Category[] = [
    { id: 'all', label: 'ทั้งหมด', labelEn: 'All' },
    { id: 'pharmacotherapy', label: 'วิทยาลัยเภสัชบำบัด', labelEn: 'College of Pharmacotherapy' },
    { id: 'consumer-protection', label: 'วิทยาลัยการคุ้มครองผู้บริโภคด้านยาและสุขภาพ', labelEn: 'College of Consumer Health Protection' },
    { id: 'herbal', label: 'วิทยาลัยเภสัชกรรมสมุนไพร', labelEn: 'College of Herbal Pharmacy' },
    { id: 'industrial', label: 'วิทยาลัยเภสัชกรรมอุตสาหการ', labelEn: 'College of Industrial Pharmacy' },
    { id: 'management', label: 'วิทยาลัยการบริหารเภสัชกิจ', labelEn: 'College of Pharmacy Management' },
    { id: 'community', label: 'วิทยาลัยเภสัชกรรมชุมชน', labelEn: 'College of Community Pharmacy' },
    { id: 'precision', label: 'วิทยาลัยเภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ', labelEn: 'College of Pharmacogenomics & Precision Pharmacy' },
];

// Price ranges for filtering
export const PRICE_RANGES: PriceRange[] = [
    { label: 'ทุกราคา', labelEn: 'All Prices', min: 0, max: Infinity },
    { label: '0 - 1,000 บาท', labelEn: '0 - 1,000 THB', min: 0, max: 1000 },
    { label: '1,001 - 5,000 บาท', labelEn: '1,001 - 5,000 THB', min: 1001, max: 5000 },
    { label: '5,001+ บาท', labelEn: '5,001+ THB', min: 5001, max: Infinity },
];

// Course levels
export const LEVELS = ['All Level', 'Beginner', 'Intermediate', 'Advanced'] as const;
export type CourseLevel = typeof LEVELS[number];
