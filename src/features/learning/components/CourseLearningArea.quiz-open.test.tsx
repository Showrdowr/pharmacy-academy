import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/api';
import CourseLearningArea from './CourseLearningArea';
import {
    createLearningCourseFixture,
    createLessonFixture,
} from '@/test/learning-fixtures';

const learningMessages = require('../../../messages/th/learning.json') as {
    learning: {
        courseArea: Record<string, string>;
    };
};
const learningText = learningMessages.learning.courseArea;

const testState = vi.hoisted(() => ({
    auth: {
        isAuthenticated: true,
        isLoading: false,
    },
    routerPush: vi.fn(),
    router: null as any,
    searchParams: {
        courseId: '12',
    },
    api: {
        getCourseLearning: vi.fn(),
        submitVideoQuestionAnswer: vi.fn(),
        getLessonQuizRuntime: vi.fn(),
        submitLessonQuizAttempt: vi.fn(),
        markLessonComplete: vi.fn(),
        updateLessonProgress: vi.fn(),
    },
    player: {
        props: null as any,
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        setCurrentTime: vi.fn((seconds: number) => Promise.resolve(seconds)),
        getCurrentTime: vi.fn().mockResolvedValue(0),
        getDuration: vi.fn().mockResolvedValue(600),
    },
}));

testState.router = {
    push: (...args: any[]) => testState.routerPush(...args),
};

vi.mock('next/navigation', () => ({
    useRouter: () => testState.router,
    useSearchParams: () => ({
        get: (key: string) => {
            if (key === 'courseId' || key === 'id') {
                return testState.searchParams.courseId;
            }

            return null;
        },
    }),
}));

vi.mock('next-intl', () => {
    const translatorCache = new Map<string | undefined, (key: string, values?: Record<string, unknown>) => string>();

    const interpolate = (template: string, values?: Record<string, unknown>) => {
        if (!values) {
            return template;
        }

        return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
    };

    return {
        useLocale: () => 'th',
        useTranslations: (namespace?: string) => {
            const cachedTranslator = translatorCache.get(namespace);
            if (cachedTranslator) {
                return cachedTranslator;
            }

            const scopedMessages = namespace
                ? namespace.split('.').reduce<unknown>((acc, part) => {
                    if (!acc || typeof acc !== 'object') {
                        return undefined;
                    }

                    return (acc as Record<string, unknown>)[part];
                }, learningMessages as unknown)
                : learningMessages;

            const translator = (key: string, values?: Record<string, unknown>) => {
                const template = scopedMessages && typeof scopedMessages === 'object'
                    ? (scopedMessages as Record<string, string>)[key]
                    : undefined;

                if (!template) {
                    return key;
                }

                return interpolate(template, values);
            };

            translatorCache.set(namespace, translator);
            return translator;
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
        isAuthenticated: testState.auth.isAuthenticated,
        isLoading: testState.auth.isLoading,
        user: null,
    }),
}));

vi.mock('../services/learningApi', () => ({
    learningApi: testState.api,
}));

vi.mock('./VimeoLessonPlayer', () => {
    const ReactModule = require('react') as typeof React;

    const MockVimeoLessonPlayer = (props: any) => {
        testState.player.props = props;

        if (props.playerRef) {
            props.playerRef.current = testState.player;
        }

        ReactModule.useEffect(() => {
            return () => {
                if (props.playerRef) {
                    props.playerRef.current = null;
                }
            };
        }, [props.playbackUrl, props.playerRef]);

        return <div data-testid="mock-vimeo-player">{props.title}</div>;
    };

    return {
        VimeoLessonPlayer: MockVimeoLessonPlayer,
    };
});

describe('CourseLearningArea quiz opening', () => {
    beforeEach(() => {
        testState.routerPush.mockReset();
        testState.api.getCourseLearning.mockReset();
        testState.api.submitVideoQuestionAnswer.mockReset();
        testState.api.getLessonQuizRuntime.mockReset();
        testState.api.submitLessonQuizAttempt.mockReset();
        testState.api.markLessonComplete.mockReset();
        testState.api.updateLessonProgress.mockReset();
        testState.player.props = null;
        window.localStorage.clear();

        testState.api.updateLessonProgress.mockResolvedValue({
            lastWatchedSeconds: 600,
            isCompleted: false,
        });
        testState.api.getLessonQuizRuntime.mockResolvedValue({
            id: 44,
            lessonId: 1,
            passingScorePercent: 70,
            maxAttempts: 3,
            attemptsUsed: 0,
            remainingAttempts: 3,
            latestAttempt: null,
            questions: [],
        });
    });

    it('waits for progress sync to finish before requesting the quiz runtime', async () => {
        let resolveProgress!: (value: { lastWatchedSeconds: number; isCompleted: boolean }) => void;
        testState.api.updateLessonProgress.mockImplementation(() => new Promise((resolve) => {
            resolveProgress = resolve;
        }));

        testState.api.getCourseLearning.mockResolvedValue(createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    interactiveQuestions: [],
                    documents: [],
                    progress: { lastWatchedSeconds: 600, isCompleted: false },
                    lessonQuiz: {
                        id: 44,
                        passingScorePercent: 70,
                        maxAttempts: 3,
                        questionsCount: 1,
                        attemptsUsed: 0,
                        remainingAttempts: 3,
                        latestAttempt: null,
                    },
                }),
            ],
        }));

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByText(learningText.quizTitle)).toBeInTheDocument();
        const startQuizButton = screen.getByRole('button', { name: learningText.startQuiz });
        await user.click(startQuizButton);

        expect(startQuizButton).toBeDisabled();
        expect(screen.queryByText(learningText.quizLoading)).not.toBeInTheDocument();
        expect(screen.queryByText(learningText.quizLoadFailed)).not.toBeInTheDocument();
        expect(testState.api.getLessonQuizRuntime).not.toHaveBeenCalled();

        resolveProgress({ lastWatchedSeconds: 600, isCompleted: false });

        await waitFor(() => {
            expect(testState.api.getLessonQuizRuntime).toHaveBeenCalledWith(1);
        });
    });

    it('shows a progress sync notice when quiz opening is blocked before runtime loads', async () => {
        testState.api.updateLessonProgress.mockRejectedValue(new ApiError('Server error', {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
        }));

        testState.api.getCourseLearning.mockResolvedValue(createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    interactiveQuestions: [],
                    documents: [],
                    progress: { lastWatchedSeconds: 600, isCompleted: false },
                    lessonQuiz: {
                        id: 44,
                        passingScorePercent: 70,
                        maxAttempts: 3,
                        questionsCount: 1,
                        attemptsUsed: 0,
                        remainingAttempts: 3,
                        latestAttempt: null,
                    },
                }),
            ],
        }));

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByText(learningText.quizTitle)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: learningText.startQuiz }));

        await waitFor(() => {
            expect(screen.getByText(learningText.quizProgressSyncFailed)).toBeInTheDocument();
        });
        expect(screen.queryByText(learningText.quizLoadFailed)).not.toBeInTheDocument();
        expect(testState.api.getLessonQuizRuntime).not.toHaveBeenCalled();
    });

    it('reopens an already loaded quiz without forcing another progress sync', async () => {
        testState.api.getCourseLearning.mockResolvedValue(createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    interactiveQuestions: [],
                    documents: [],
                    progress: { lastWatchedSeconds: 600, isCompleted: false },
                    lessonQuiz: {
                        id: 44,
                        passingScorePercent: 70,
                        maxAttempts: 3,
                        questionsCount: 1,
                        attemptsUsed: 0,
                        remainingAttempts: 3,
                        latestAttempt: null,
                    },
                }),
            ],
        }));

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByText(learningText.quizTitle)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: learningText.startQuiz }));

        await waitFor(() => {
            expect(testState.api.updateLessonProgress).toHaveBeenCalledTimes(1);
            expect(testState.api.getLessonQuizRuntime).toHaveBeenCalledTimes(1);
        });

        await user.click(screen.getAllByRole('button', { name: learningText.quizCollapse })[0]);
        expect(screen.queryByRole('button', { name: learningText.quizSubmit })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: learningText.startQuiz }));

        await waitFor(() => {
            expect(testState.api.updateLessonProgress).toHaveBeenCalledTimes(1);
            expect(testState.api.getLessonQuizRuntime).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByRole('button', { name: learningText.quizSubmit })).toBeInTheDocument();
    });
});
