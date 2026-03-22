/**
 * Thai Date Formatting Utility
 */

export const formatThaiDate = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) return '-';

        return dateObj.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

export const formatThaiDateShort = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) return '-';

        return dateObj.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};
