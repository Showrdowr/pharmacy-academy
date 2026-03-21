export function getNumericCoursePrice(price: unknown): number | null {
    const parsed = Number(price);
    return Number.isFinite(parsed) ? parsed : null;
}

export function isFreeCourse(price: unknown): boolean {
    const normalizedPrice = getNumericCoursePrice(price);
    return normalizedPrice === null || normalizedPrice <= 0;
}

export function formatCoursePrice(price: unknown): string {
    const normalizedPrice = getNumericCoursePrice(price);
    if (normalizedPrice === null || normalizedPrice <= 0) {
        return 'ฟรี';
    }

    return `฿${normalizedPrice.toLocaleString('th-TH')}`;
}
