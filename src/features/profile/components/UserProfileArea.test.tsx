import { render, screen } from '@testing-library/react';
import UserProfileArea from './UserProfileArea';

import profileMessages from '@/messages/en/profile.json';

const mockUseAuth = vi.fn();
const mockUseEnrolledCourses = vi.fn();

vi.mock('next-intl', () => ({
    useTranslations: (namespace?: string) => {
        const scopedMessages = namespace
            ? namespace.split('.').reduce<unknown>((acc, part) => {
                if (!acc || typeof acc !== 'object') {
                    return undefined;
                }

                return (acc as Record<string, unknown>)[part];
            }, profileMessages)
            : profileMessages;

        return (key: string, values?: Record<string, unknown>) => {
            const template = key.split('.').reduce<unknown>((acc, part) => {
                if (!acc || typeof acc !== 'object') {
                    return undefined;
                }

                return (acc as Record<string, unknown>)[part];
            }, scopedMessages);

            if (typeof template !== 'string') {
                return key;
            }

            if (!values) {
                return template;
            }

            return template.replace(/\{(\w+)\}/g, (_, token: string) => String(values[token] ?? `{${token}}`));
        };
    },
}));

vi.mock('@/features/i18n', () => ({
    useAppLocale: () => ({ locale: 'en' }),
    formatLocaleDate: (value?: string | null) => value ? new Date(value).toLocaleDateString('en-US') : '-',
}));

vi.mock('@/features/auth', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('@/features/courses/hooks', () => ({
    useEnrolledCourses: (...args: unknown[]) => mockUseEnrolledCourses(...args),
}));

describe('UserProfileArea', () => {
    beforeEach(() => {
        mockUseEnrolledCourses.mockImplementation((enabled: boolean, status?: string) => ({
            enrolledCourses: status === 'cancelled'
                ? []
                : [
                    {
                        id: 101,
                        courseId: 101,
                        title: 'Clinical Pharmacy Basics',
                        authorName: 'Dr. Example',
                        instructor: 'Dr. Example',
                        status: 'completed',
                        enrollmentStatus: 'ACTIVE',
                        cpeCredits: 12,
                        watchPercent: 100,
                        completionPercent: 100,
                        courseStatus: 'PUBLISHED',
                    },
                ],
            isLoading: false,
            error: null,
            refresh: vi.fn(),
        }));
    });

    it('hides pharmacist-only CPE and license sections for general users', () => {
        mockUseAuth.mockReturnValue({
            user: {
                id: 1,
                fullName: 'Alex General',
                email: 'general@example.com',
                role: 'general',
            },
            isAuthenticated: true,
        });

        render(<UserProfileArea />);

        expect(screen.getByText('General User')).toBeInTheDocument();
        expect(screen.queryByTestId('profile-cpe-desktop')).not.toBeInTheDocument();
        expect(screen.queryByTestId('profile-professional-info')).not.toBeInTheDocument();
        expect(screen.queryByTestId('profile-stat-cpeCredits')).not.toBeInTheDocument();
        expect(screen.queryByText('Professional License Number')).not.toBeInTheDocument();
        expect(screen.queryByText(/12 Credits/)).not.toBeInTheDocument();
        expect(screen.queryByText('Cancelled Courses / Refund Requests')).not.toBeInTheDocument();
    });

    it('shows license, verification status, and CPE details for pharmacists', () => {
        mockUseAuth.mockReturnValue({
            user: {
                id: 2,
                fullName: 'Dr. Pharma',
                email: 'pharmacist@example.com',
                role: 'pharmacist',
                professionalLicenseNumber: 'PH-12345',
                pharmacistVerificationStatus: 'verified',
            },
            isAuthenticated: true,
        });

        render(<UserProfileArea />);

        expect(screen.getByTestId('profile-cpe-desktop')).toBeInTheDocument();
        expect(screen.getByTestId('profile-professional-info')).toBeInTheDocument();
        expect(screen.getByTestId('profile-stat-cpeCredits')).toBeInTheDocument();
        expect(screen.getByText('Professional License Number')).toBeInTheDocument();
        expect(screen.getByText('PH-12345')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText(/12 Credits/)).toBeInTheDocument();
    });
});
