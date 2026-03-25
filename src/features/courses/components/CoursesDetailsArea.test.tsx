import { render, screen } from '@testing-library/react';
import CoursesDetailsArea from './CoursesDetailsArea';

import courseMessages from '@/messages/en/courses.json';

const mockUseAuth = vi.fn();
const mockAddToCart = vi.fn();
const mockGetEnrolledCourses = vi.fn();
const mockEnrollCourse = vi.fn();
const mockPush = vi.fn();

function getMessage(namespace: string | undefined, key: string, values?: Record<string, unknown>) {
    const root = courseMessages as Record<string, unknown>;
    const scoped = namespace
        ? namespace.split('.').reduce<unknown>((acc, part) => {
            if (!acc || typeof acc !== 'object') {
                return undefined;
            }

            return (acc as Record<string, unknown>)[part];
        }, root)
        : root;

    const template = key.split('.').reduce<unknown>((acc, part) => {
        if (!acc || typeof acc !== 'object') {
            return undefined;
        }

        return (acc as Record<string, unknown>)[part];
    }, scoped);

    if (typeof template !== 'string') {
        return key;
    }

    if (!values) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, token: string) => String(values[token] ?? `{${token}}`));
}

vi.mock('next-intl', () => ({
    useTranslations: (namespace?: string) => (key: string, values?: Record<string, unknown>) =>
        getMessage(namespace, key, values),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => ({
        get: () => null,
    }),
}));

vi.mock('next/image', () => ({
    default: ({ alt, fill: _fill, priority: _priority, ...props }: Record<string, unknown>) => <img alt={String(alt || '')} {...props} />,
}));

vi.mock('@/features/i18n', () => ({
    useAppLocale: () => ({ locale: 'en' }),
    getLocalizedContent: (locale: string, primary?: string | null, secondary?: string | null) =>
        locale === 'en' && secondary ? secondary : primary,
}));

vi.mock('@/features/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/auth')>();

    return {
        ...actual,
        useAuth: () => mockUseAuth(),
    };
});

vi.mock('@/features/cart/hooks', () => ({
    useAddToCart: () => ({ addToCart: mockAddToCart }),
}));

vi.mock('@/features/courses/services/coursesApi', () => ({
    coursesService: {
        getEnrolledCourses: (...args: unknown[]) => mockGetEnrolledCourses(...args),
        enrollCourse: (...args: unknown[]) => mockEnrollCourse(...args),
    },
}));

vi.mock('./CoursePreviewVideoModal', () => ({
    CoursePreviewVideoModal: () => null,
}));

vi.mock('@/components/common/VideoPopup', () => ({
    default: () => null,
}));

vi.mock('./SidebarCards', () => ({
    PriceCard: () => <div data-testid="price-card" />,
    CPECard: () => <div data-testid="cpe-card" />,
    CategoryCard: () => <div data-testid="category-card" />,
    CourseInfoCard: () => <div data-testid="course-info-card" />,
    TimelineCard: () => <div data-testid="timeline-card" />,
}));

vi.mock('./CourseContentSections', () => ({
    DescriptionSection: () => <div data-testid="description-section" />,
    LessonsSection: () => <div data-testid="lessons-section" />,
}));

const baseCourse = {
    id: 44,
    title: 'Telepharmacy Program',
    titleEn: 'Telepharmacy Program',
    description: 'Course description',
    descriptionEn: 'Course description',
    details: 'Course details',
    detailsEn: 'Course details',
    category: 'Clinical',
    categoryEn: 'Clinical',
    instructor: 'Dr. Demo',
    price: 1200,
    image: '/assets/img/courses/01.jpg',
    lessons: [{ id: 1, title: 'Lesson 1' }],
    audience: 'pharmacist',
};

describe('CoursesDetailsArea audience gating', () => {
    beforeEach(() => {
        mockGetEnrolledCourses.mockResolvedValue([]);
    });

    it('shows access denied state for general users on pharmacist-only courses', async () => {
        mockUseAuth.mockReturnValue({
            user: {
                id: 1,
                fullName: 'General User',
                email: 'general@example.com',
                role: 'general',
            },
            isAuthenticated: true,
            isLoading: false,
        });

        render(<CoursesDetailsArea initialData={baseCourse} />);

        expect((await screen.findAllByText('You do not have access to this course')).length).toBeGreaterThan(0);
        expect(screen.queryByTestId('price-card')).not.toBeInTheDocument();
        expect(screen.queryByTestId('lessons-section')).not.toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'Browse other courses' }).length).toBeGreaterThan(0);
    });

    it('keeps normal course detail UI for pharmacists', async () => {
        mockUseAuth.mockReturnValue({
            user: {
                id: 2,
                fullName: 'Pharmacist User',
                email: 'pharmacist@example.com',
                role: 'pharmacist',
            },
            isAuthenticated: true,
            isLoading: false,
        });

        render(<CoursesDetailsArea initialData={baseCourse} />);

        expect(await screen.findByTestId('price-card')).toBeInTheDocument();
        expect(screen.getByTestId('description-section')).toBeInTheDocument();
        expect(screen.getByTestId('lessons-section')).toBeInTheDocument();
        expect(screen.queryByText('You do not have access to this course')).not.toBeInTheDocument();
    });

    it('shows refund pending state instead of purchase UI when a cancelled paid enrollment is awaiting refund', async () => {
        mockUseAuth.mockReturnValue({
            user: {
                id: 3,
                fullName: 'General User',
                email: 'general@example.com',
                role: 'general',
            },
            isAuthenticated: true,
            isLoading: false,
        });
        mockGetEnrolledCourses.mockResolvedValue([
            {
                id: 44,
                courseId: 44,
                title: 'Telepharmacy Program',
                status: 'in_progress',
                enrollmentStatus: 'REFUND_PENDING',
                refundRequestStatus: 'PENDING',
            },
        ]);

        render(<CoursesDetailsArea initialData={{ ...baseCourse, audience: 'all' }} />);

        expect(await screen.findByText('Refund Request in Progress')).toBeInTheDocument();
        expect(screen.queryByTestId('price-card')).not.toBeInTheDocument();
    });
});
