import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CourseLearningArea from './CourseLearningArea';
import {
    createLearningCourseFixture,
    createLessonFixture,
    createLessonVideoFixture,
} from '@/test/learning-fixtures';

const learningMessages = require('../../../messages/th/learning.json') as {
    learning: {
        courseArea: Record<string, string>;
    };
};

const testState = vi.hoisted(() => {
    const routerPush = vi.fn();

    return {
        routerPush,
        router: {
            push: (...args: any[]) => routerPush(...args),
        },
        searchParams: {
            get: (key: string) => {
                if (key === 'courseId' || key === 'id') {
                    return '12';
                }

                return null;
            },
        },
        api: {
            getCourseLearning: vi.fn(),
            syncLessonVideoStatus: vi.fn(),
        },
        player: {
            props: null as any,
        },
    };
});

vi.mock('next/navigation', () => ({
    useRouter: () => testState.router,
    useSearchParams: () => testState.searchParams,
}));

vi.mock('next-intl', () => {
    const messages = require('../../../messages/th/learning.json') as {
        learning: {
            courseArea: Record<string, string>;
        };
    };
    const translationCache = new Map<string, (key: string, values?: Record<string, unknown>) => string>();

    const interpolate = (template: string, values?: Record<string, unknown>) => {
        if (!values) {
            return template;
        }

        return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
    };

    return {
        useLocale: () => 'th',
        useTranslations: (namespace?: string) => {
            const cacheKey = namespace || '__root__';
            if (!translationCache.has(cacheKey)) {
                const scopedMessages = namespace
                    ? namespace.split('.').reduce<unknown>((acc, part) => {
                        if (!acc || typeof acc !== 'object') {
                            return undefined;
                        }

                        return (acc as Record<string, unknown>)[part];
                    }, messages)
                    : messages;

                translationCache.set(cacheKey, (key: string, values?: Record<string, unknown>) => {
                    const template = typeof scopedMessages === 'object' && scopedMessages
                        ? (scopedMessages as Record<string, unknown>)[key]
                        : undefined;

                    return typeof template === 'string' ? interpolate(template, values) : key;
                });
            }

            return translationCache.get(cacheKey)!;
        },
    };
});

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={typeof href === 'string' ? href : href?.pathname || '#'} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('@/features/auth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
        user: null,
    }),
}));

vi.mock('../services/learningApi', () => ({
    learningApi: testState.api,
}));

vi.mock('./VimeoLessonPlayer', () => ({
    VimeoLessonPlayer: (props: any) => {
        testState.player.props = props;
        return <div data-testid="mock-vimeo-player">{props.title}</div>;
    },
}));

describe('CourseLearningArea lesson video sync', () => {
    beforeEach(() => {
        testState.routerPush.mockReset();
        testState.api.getCourseLearning.mockReset();
        testState.api.syncLessonVideoStatus.mockReset();
        testState.player.props = null;
    });

    it('waits for lesson video sync before mounting the Vimeo player', async () => {
        let resolveSync!: (value: { lessonId: number; video: ReturnType<typeof createLessonVideoFixture> | null }) => void;
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture(),
            ],
        });

        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.syncLessonVideoStatus.mockImplementation(() => new Promise((resolve) => {
            resolveSync = resolve;
        }));

        render(<CourseLearningArea />);

        expect(await screen.findByText('คอร์สตัวอย่าง')).toBeInTheDocument();
        await waitFor(() => {
            expect(testState.api.syncLessonVideoStatus).toHaveBeenCalledWith(12, 1);
        });
        expect(screen.queryByTestId('mock-vimeo-player')).not.toBeInTheDocument();
        expect(screen.getByText(learningMessages.learning.courseArea.playerLoading)).toBeInTheDocument();

        resolveSync({
            lessonId: 1,
            video: createLessonVideoFixture(),
        });

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        expect(testState.player.props?.playbackUrl).toBe('https://player.vimeo.com/video/1175386748?h=testhash');
    });

    it('shows the failed video state after sync marks the lesson asset as unavailable', async () => {
        let resolveSync!: (value: { lessonId: number; video: ReturnType<typeof createLessonVideoFixture> | null }) => void;
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture(),
            ],
        });

        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.syncLessonVideoStatus.mockImplementation(() => new Promise((resolve) => {
            resolveSync = resolve;
        }));

        render(<CourseLearningArea />);

        expect(await screen.findByText('คอร์สตัวอย่าง')).toBeInTheDocument();
        await waitFor(() => {
            expect(testState.api.syncLessonVideoStatus).toHaveBeenCalledWith(12, 1);
        });

        resolveSync({
            lessonId: 1,
            video: createLessonVideoFixture({
                status: 'FAILED',
                playbackUrl: null,
            }),
        });

        expect(await screen.findByText(learningMessages.learning.courseArea.runtimeVideoFailed)).toBeInTheDocument();
        expect(screen.queryByTestId('mock-vimeo-player')).not.toBeInTheDocument();
    });
});
