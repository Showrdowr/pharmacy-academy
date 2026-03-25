import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/api';
import CourseLearningArea from './CourseLearningArea';
import {
    createInteractiveQuestionFixture,
    createLearningCourseFixture,
    createLessonFixture,
    createLessonDocumentFixture,
    createLessonVideoFixture,
} from '@/test/learning-fixtures';

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

let mockedNow = 0;
let dateNowSpy: ReturnType<typeof vi.spyOn> | null = null;
let mockedDocumentHidden = false;
let mockedVisibilityState: DocumentVisibilityState = 'visible';
let fetchMock: ReturnType<typeof vi.fn>;
let windowOpenSpy: ReturnType<typeof vi.spyOn> | null = null;
let createObjectUrlSpy: ReturnType<typeof vi.spyOn> | null = null;
let revokeObjectUrlSpy: ReturnType<typeof vi.spyOn> | null = null;
let openedPreviewWindow: { close: ReturnType<typeof vi.fn>; location: { href: string } } | null = null;

testState.router = {
    push: (...args: any[]) => testState.routerPush(...args),
};

function resetPlayerHarness() {
    testState.player.props = null;
    testState.player.play.mockClear();
    testState.player.pause.mockClear();
    testState.player.destroy.mockClear();
    testState.player.setCurrentTime.mockClear();
    testState.player.getCurrentTime.mockClear();
    testState.player.getDuration.mockClear();
}

function emitInitialPosition(seconds?: number) {
    const resolvedSeconds = seconds ?? testState.player.props?.resumeAt ?? 0;
    testState.player.props?.onInitialTimeResolved?.(resolvedSeconds);
}

function emitTimeUpdate(seconds: number) {
    testState.player.props?.onTimeUpdate?.(seconds);
}

function emitSeeked(seconds: number) {
    testState.player.props?.onSeeked?.(seconds);
}

function advancePlaybackClock(seconds: number) {
    mockedNow += seconds * 1000;
}

function setDocumentVisibility(hidden: boolean) {
    mockedDocumentHidden = hidden;
    mockedVisibilityState = hidden ? 'hidden' : 'visible';
}

Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => mockedDocumentHidden,
});

Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => mockedVisibilityState,
});

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
    const messages = require('../../../messages/th/learning.json') as {
        learning: {
            courseArea: Record<string, string>;
        };
    };
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
                }, messages)
                : messages;

            const translator = (key: string, values?: Record<string, unknown>) => {
                const template = typeof scopedMessages === 'object' && scopedMessages
                    ? (scopedMessages as Record<string, unknown>)[key]
                    : undefined;

                if (typeof template !== 'string') {
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

async function expectInteractiveModal(questionText: string) {
    expect(await screen.findByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' })).toBeInTheDocument();
    await waitFor(() => {
        expect(screen.getAllByText(questionText).length).toBeGreaterThan(1);
    });
}

describe('CourseLearningArea interactive harness', () => {
    beforeEach(() => {
        mockedNow = 0;
        setDocumentVisibility(false);
        dateNowSpy?.mockRestore();
        dateNowSpy = vi.spyOn(Date, 'now').mockImplementation(() => mockedNow);
        fetchMock = vi.fn().mockResolvedValue({
            blob: vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
        });
        vi.stubGlobal('fetch', fetchMock as typeof fetch);
        openedPreviewWindow = {
            close: vi.fn(),
            location: { href: '' },
        };
        windowOpenSpy?.mockRestore();
        windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => openedPreviewWindow as unknown as Window);
        createObjectUrlSpy?.mockRestore();
        createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:lesson-document');
        revokeObjectUrlSpy?.mockRestore();
        revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
        testState.auth.isAuthenticated = true;
        testState.auth.isLoading = false;
        testState.searchParams.courseId = '12';
        testState.routerPush.mockReset();
        testState.api.getCourseLearning.mockReset();
        testState.api.submitVideoQuestionAnswer.mockReset();
        testState.api.getLessonQuizRuntime.mockReset();
        testState.api.submitLessonQuizAttempt.mockReset();
        testState.api.markLessonComplete.mockReset();
        testState.api.updateLessonProgress.mockReset();
        testState.api.updateLessonProgress.mockResolvedValue({
            lastWatchedSeconds: 0,
            isCompleted: false,
        });
        testState.api.submitVideoQuestionAnswer.mockResolvedValue({
            id: 1,
            videoQuestionId: 1,
            answerGiven: 'option-a',
            answered: true,
            updatedAt: '2026-03-21T00:00:00.000Z',
        });
        testState.api.getLessonQuizRuntime.mockResolvedValue({
            id: 1,
            lessonId: 1,
            passingScorePercent: 80,
            maxAttempts: null,
            attemptsUsed: 0,
            remainingAttempts: null,
            latestAttempt: null,
            questions: [],
        });
        testState.api.submitLessonQuizAttempt.mockResolvedValue({
            attemptId: 1,
            quizId: 1,
            lessonId: 1,
            attemptNumber: 1,
            maxAttempts: null,
            attemptsUsed: 1,
            remainingAttempts: null,
            scoreObtained: 1,
            totalScore: 1,
            scorePercent: 100,
            isPassed: true,
            answers: [],
        });
        testState.api.markLessonComplete.mockResolvedValue({
            lessonId: 1,
            isCompleted: true,
            progressPercent: 100,
        });
        resetPlayerHarness();
    });

    afterEach(() => {
        dateNowSpy?.mockRestore();
        dateNowSpy = null;
        windowOpenSpy?.mockRestore();
        windowOpenSpy = null;
        createObjectUrlSpy?.mockRestore();
        createObjectUrlSpy = null;
        revokeObjectUrlSpy?.mockRestore();
        revokeObjectUrlSpy = null;
        openedPreviewWindow = null;
        vi.unstubAllGlobals();
    });

    it('shows loading state while auth is still loading', () => {
        testState.auth.isLoading = true;

        const { unmount } = render(<CourseLearningArea />);

        expect(screen.getByText('กำลังโหลดเนื้อหาการเรียน')).toBeInTheDocument();
        expect(testState.api.getCourseLearning).not.toHaveBeenCalled();
    });

    it('opens PDF lesson documents stored as data URLs via a blob URL', async () => {
        testState.api.getCourseLearning.mockResolvedValue(
            createLearningCourseFixture({
                lessons: [
                    createLessonFixture({
                        documents: [{
                            id: 99,
                            fileName: 'Sponsorship01.pdf',
                            mimeType: 'application/pdf',
                            sizeBytes: 2_000_000,
                            fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
                        }],
                    }),
                ],
            })
        );

        render(<CourseLearningArea />);

        const previewButton = await screen.findByRole('button', { name: 'เปิดเอกสาร Sponsorship01.pdf' });

        await userEvent.click(previewButton);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('data:application/pdf;base64,JVBERi0xLjQK');
            expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(openedPreviewWindow?.location.href).toBe('blob:lesson-document');
        });
    });

    it('downloads PDF lesson documents stored as data URLs via a blob URL', async () => {
        const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

        testState.api.getCourseLearning.mockResolvedValue(
            createLearningCourseFixture({
                lessons: [
                    createLessonFixture({
                        documents: [{
                            id: 100,
                            fileName: '1.pdf',
                            mimeType: 'application/pdf',
                            sizeBytes: 1_900_000,
                            fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
                        }],
                    }),
                ],
            })
        );

        render(<CourseLearningArea />);

        const downloadButton = await screen.findByRole('button', { name: 'ดาวน์โหลดเอกสาร 1.pdf' });
        await userEvent.click(downloadButton);

        await waitFor(() => {
            expect(fetchMock).not.toHaveBeenCalled();
            expect(anchorClickSpy).toHaveBeenCalled();
        });

        anchorClickSpy.mockRestore();
    });

    it('lets learners switch between lesson documents and interactive checkpoints', async () => {
        const user = userEvent.setup();

        testState.api.getCourseLearning.mockResolvedValue(
            createLearningCourseFixture({
                lessons: [
                    createLessonFixture({
                        documents: [
                            createLessonDocumentFixture({
                                id: 301,
                                fileName: 'lesson-handout.pdf',
                            }),
                        ],
                        interactiveQuestions: [
                            createInteractiveQuestionFixture({
                                id: 401,
                                questionText: 'คำถามสำหรับแท็บ interactive',
                            }),
                        ],
                    }),
                ],
            })
        );

        render(<CourseLearningArea />);

        const documentsTab = await screen.findByRole('tab', { name: /เอกสารประกอบบทเรียน/i });
        const interactiveTab = screen.getByRole('tab', { name: /จุดพัก Interactive/i });

        expect(documentsTab).toHaveAttribute('aria-selected', 'true');
        expect(interactiveTab).toHaveAttribute('aria-selected', 'false');
        expect(screen.getByText('lesson-handout.pdf')).toBeInTheDocument();
        expect(screen.queryByText('คำถามสำหรับแท็บ interactive')).not.toBeInTheDocument();

        await user.click(interactiveTab);

        expect(documentsTab).toHaveAttribute('aria-selected', 'false');
        expect(interactiveTab).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('คำถามสำหรับแท็บ interactive')).toBeInTheDocument();
        expect(screen.queryByText('lesson-handout.pdf')).not.toBeInTheDocument();

        await user.click(documentsTab);

        expect(documentsTab).toHaveAttribute('aria-selected', 'true');
        expect(interactiveTab).toHaveAttribute('aria-selected', 'false');
        expect(screen.getByText('lesson-handout.pdf')).toBeInTheDocument();
    });

    it('shows the interactive tab content by default when the lesson has no documents', async () => {
        testState.api.getCourseLearning.mockResolvedValue(
            createLearningCourseFixture({
                lessons: [
                    createLessonFixture({
                        documents: [],
                        interactiveQuestions: [
                            createInteractiveQuestionFixture({
                                id: 402,
                                questionText: 'คำถามเดียวของบทเรียนนี้',
                            }),
                        ],
                    }),
                ],
            })
        );

        render(<CourseLearningArea />);

        const documentsTab = await screen.findByRole('tab', { name: /เอกสารประกอบบทเรียน/i });
        const interactiveTab = screen.getByRole('tab', { name: /จุดพัก Interactive/i });

        expect(documentsTab).toHaveAttribute('aria-selected', 'false');
        expect(interactiveTab).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('คำถามเดียวของบทเรียนนี้')).toBeInTheDocument();
        expect(screen.queryByText('ยังไม่มีเอกสารในบทเรียนนี้')).not.toBeInTheDocument();
    });

    it('redirects unauthenticated users to sign-in', async () => {
        testState.auth.isAuthenticated = false;

        const { unmount } = render(<CourseLearningArea />);

        await waitFor(() => {
            expect(testState.routerPush).toHaveBeenCalledWith('/sign-in');
        });
        expect(testState.api.getCourseLearning).not.toHaveBeenCalled();
    });

    it('redirects to sign-in when the learning API returns UNAUTHORIZED', async () => {
        testState.api.getCourseLearning.mockRejectedValue(new ApiError('Unauthorized', {
            statusCode: 401,
            code: 'UNAUTHORIZED',
        }));

        const { unmount } = render(<CourseLearningArea />);

        await waitFor(() => {
            expect(testState.routerPush).toHaveBeenCalledWith('/sign-in');
        });
    });

    it('shows a page error instead of redirecting when the learning API returns FORBIDDEN access', async () => {
        testState.api.getCourseLearning.mockRejectedValue(new ApiError('กรุณาสมัครเรียนก่อนเข้าดูเนื้อหา', {
            statusCode: 403,
            code: 'COURSE_NOT_ENROLLED',
        }));

        const { unmount } = render(<CourseLearningArea />);

        expect(await screen.findByText('กรุณาสมัครเรียนก่อนเข้าดูเนื้อหา')).toBeInTheDocument();
        expect(testState.routerPush).not.toHaveBeenCalledWith('/sign-in');
    });

    it('opens an interactive immediately after initial resume when progress already passed the question', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 11,
                            lessonId: 1,
                            questionText: 'คำถามที่ต้องเด้งทันที',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(125);
        });
        await expectInteractiveModal('คำถามที่ต้องเด้งทันที');
        await waitFor(() => {
            expect(testState.player.pause).toHaveBeenCalled();
        });
    });

    it('opens an interactive when timeupdate reaches the configured display second', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 21,
                            lessonId: 1,
                            questionText: 'คำถามระหว่างเล่น',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' })).not.toBeInTheDocument();

        act(() => {
            emitInitialPosition(0);
        });
        act(() => {
            advancePlaybackClock(120);
            emitTimeUpdate(120);
        });

        await expectInteractiveModal('คำถามระหว่างเล่น');
    });

    it('opens the earliest pending question after initial resume and resumes only after all pending questions are answered', async () => {
        const firstQuestion = createInteractiveQuestionFixture({
            id: 31,
            lessonId: 1,
            questionText: 'คำถามแรก',
            displayAtSeconds: 120,
            sortOrder: 1,
        });
        const secondQuestion = createInteractiveQuestionFixture({
            id: 32,
            lessonId: 1,
            questionText: 'คำถามถัดไป',
            displayAtSeconds: 180,
            sortOrder: 1,
        });
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 181, isCompleted: false },
                    interactiveQuestions: [firstQuestion, secondQuestion],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();

        act(() => {
            emitInitialPosition(181);
        });

        await expectInteractiveModal('คำถามแรก');

        await user.click(screen.getByRole('button', { name: 'คำตอบ A' }));
        await user.click(screen.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }));

        await waitFor(() => {
            expect(testState.api.submitVideoQuestionAnswer).toHaveBeenCalledWith(31, 'option-a');
        });
        await expectInteractiveModal('คำถามถัดไป');
        expect(testState.player.play).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'คำตอบ A' }));
        await user.click(screen.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }));

        await waitFor(() => {
            expect(testState.api.submitVideoQuestionAnswer).toHaveBeenCalledWith(32, 'option-a');
        });
    });

    it('blocks forward seeking beyond the furthest watched second and rewinds the player without showing the page notice', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 60, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 33,
                            lessonId: 1,
                            questionText: 'คำถามที่ไม่ควรถูกข้าม',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(60);
        });
        act(() => {
            advancePlaybackClock(1);
            emitTimeUpdate(200);
        });
        act(() => {
            emitSeeked(200);
        });

        await waitFor(() => {
            expect(testState.player.setCurrentTime).toHaveBeenCalledWith(60);
        });
        expect(screen.getByText('ไม่สามารถกรอข้ามวิดีโอได้ กรุณาเรียนตามลำดับเวลา')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' })).not.toBeInTheDocument();
    });

    it('pauses the lesson and persists progress when the page becomes hidden', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(125);
        });

        setDocumentVisibility(true);
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        await waitFor(() => {
            expect(testState.player.pause).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(testState.api.updateLessonProgress).toHaveBeenCalledWith(1, 125);
        });
    });

    it('does not show the page notice when completion is blocked by interactive progress', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 600, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 41,
                            lessonId: 1,
                            displayAtSeconds: 700,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.markLessonComplete.mockRejectedValue(new ApiError(
            'กรุณาตอบคำถาม interactive ให้ครบก่อนจบบทเรียน',
            { statusCode: 409, code: 'INTERACTIVE_INCOMPLETE' }
        ));

        render(<CourseLearningArea />);

        expect(await screen.findByText('คอร์สตัวอย่าง')).toBeInTheDocument();
        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(600);
        });
        fireEvent.click(screen.getByRole('button', { name: 'บันทึกว่าจบบทเรียน' }));

        await waitFor(() => {
            expect(testState.api.markLessonComplete).toHaveBeenCalledWith(12, 1);
        });
        expect(screen.getByText('ยังมีคำถาม interactive ค้างอยู่ กรุณาตอบให้ครบก่อนจบบทเรียน')).toBeInTheDocument();
    });

    it('renders a blocked state instead of mounting the player when the video is unavailable without showing the page notice', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    video: createLessonVideoFixture({
                        status: 'PROCESSING',
                        playbackUrl: null,
                    }),
                    interactiveQuestions: [createInteractiveQuestionFixture()],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByText('วิดีโอบทเรียนนี้ยังอยู่ระหว่างประมวลผลจาก Vimeo จึงยังไม่สามารถรับชมได้ในขณะนี้')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-vimeo-player')).not.toBeInTheDocument();
        expect(screen.queryByText('วิดีโอยังไม่พร้อมใช้งานจริง จึงยังไม่สามารถ trigger คำถาม interactive ตามเวลาได้')).not.toBeInTheDocument();
    });

    it('opens the lesson quiz panel and submits a learner attempt', async () => {
        const course = createLearningCourseFixture({
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
        });
        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.getLessonQuizRuntime.mockResolvedValue({
            id: 44,
            lessonId: 1,
            passingScorePercent: 70,
            maxAttempts: 3,
            attemptsUsed: 0,
            remainingAttempts: 3,
            latestAttempt: null,
            questions: [
                {
                    id: 401,
                    questionText: 'คำถามท้ายบท',
                    questionType: 'MULTIPLE_CHOICE',
                    scoreWeight: 1,
                    options: [
                        { id: 'option-a', text: 'คำตอบ A' },
                        { id: 'option-b', text: 'คำตอบ B' },
                    ],
                },
            ],
        });
        testState.api.submitLessonQuizAttempt.mockResolvedValue({
            attemptId: 10,
            quizId: 44,
            lessonId: 1,
            attemptNumber: 1,
            maxAttempts: 3,
            attemptsUsed: 1,
            remainingAttempts: 2,
            scoreObtained: 1,
            totalScore: 1,
            scorePercent: 100,
            isPassed: true,
            finishedAt: '2026-03-24T00:00:00.000Z',
            answers: [
                {
                    questionId: 401,
                    answerGiven: 'option-a',
                    isCorrect: true,
                    pointsEarned: 1,
                },
            ],
        });

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByText('Quiz ท้ายบท')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'เริ่มทำแบบทดสอบ' }));

        expect(await screen.findByRole('button', { name: 'คำตอบ A' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'คำตอบ A' }));
        await user.click(screen.getByRole('button', { name: 'ส่งแบบทดสอบ' }));

        await waitFor(() => {
            expect(testState.api.submitLessonQuizAttempt).toHaveBeenCalledWith(1, [
                { questionId: 401, answerGiven: 'option-a' },
            ]);
        });
        expect(await screen.findByText('คุณผ่านแบบทดสอบท้ายบทแล้ว')).toBeInTheDocument();
    });

    it('keeps the lesson quiz locked until the learner finishes the lesson', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    interactiveQuestions: [],
                    documents: [],
                    progress: { lastWatchedSeconds: 120, isCompleted: false },
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
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByText('Quiz ท้ายบท')).toBeInTheDocument();
        const lockedQuizButton = screen.getByRole('button', { name: 'เรียนให้เสร็จก่อน' });
        expect(lockedQuizButton).toBeDisabled();
        expect(testState.api.getLessonQuizRuntime).not.toHaveBeenCalled();
    });

    it('hides the completion button until the learner passes the lesson quiz', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    interactiveQuestions: [],
                    documents: [],
                    progress: { lastWatchedSeconds: 600, isCompleted: false },
                    lessonQuiz: {
                        id: 45,
                        passingScorePercent: 70,
                        maxAttempts: 3,
                        questionsCount: 1,
                        attemptsUsed: 0,
                        remainingAttempts: 3,
                        latestAttempt: null,
                    },
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByText('Quiz ท้ายบท')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'เริ่มทำแบบทดสอบ' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'ต้องผ่าน Quiz ท้ายบทก่อน' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'บันทึกว่าจบบทเรียน' })).not.toBeInTheDocument();
    });

    it('renders locked lessons from a sanitized payload without leaking player, documents, or interactive content', async () => {
        const course = createLearningCourseFixture({
            currentLessonId: 1,
            lastAccessedLessonId: 1,
            lessons: [
                createLessonFixture({
                    id: 1,
                    title: 'บทเรียนที่พร้อมเรียน',
                    sequenceOrder: 1,
                    status: 'available',
                    documents: [],
                    interactiveQuestions: [],
                }),
                createLessonFixture({
                    id: 2,
                    title: 'บทเรียนที่ยังล็อก',
                    sequenceOrder: 2,
                    status: 'locked',
                    video: null,
                    documents: [],
                    interactiveQuestions: [],
                    lessonQuiz: null,
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByRole('heading', { name: 'บทเรียนที่พร้อมเรียน' })).toBeInTheDocument();
        const lockedLessonButton = screen.getByRole('button', { name: /2\s+บทเรียนที่ยังล็อก\s+ล็อก/ });
        expect(lockedLessonButton).toBeDisabled();
        expect(lockedLessonButton).toHaveTextContent('ล็อก');
        expect(screen.queryByText('บทเรียนที่ยังล็อก video')).not.toBeInTheDocument();
        expect(screen.queryByText('คำถาม interactive ตัวอย่าง')).not.toBeInTheDocument();
    });

    it('keeps the modal open and shows an error when answer submission fails', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 51,
                            lessonId: 1,
                            questionText: 'คำถามที่ตอบไม่ผ่าน',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.submitVideoQuestionAnswer.mockRejectedValue(new ApiError('ส่งคำตอบไม่สำเร็จ', {
            statusCode: 400,
            code: 'INVALID_INTERACTIVE_ANSWER',
        }));

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(125);
        });
        await expectInteractiveModal('คำถามที่ตอบไม่ผ่าน');

        await user.click(screen.getByRole('button', { name: 'คำตอบ A' }));
        await user.click(screen.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }));

        expect(await screen.findByText('ส่งคำตอบไม่สำเร็จ')).toBeInTheDocument();
        expect(screen.getAllByText('คำถามที่ตอบไม่ผ่าน').length).toBeGreaterThan(1);
    });

    it('shows a specific submit error when the backend rejects an answer with LESSON_LOCKED', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 52,
                            lessonId: 1,
                            questionText: 'คำถามที่ถูกล็อกฝั่ง backend',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.submitVideoQuestionAnswer.mockRejectedValue(new ApiError(
            'กรุณาเรียนบทก่อนหน้าให้เสร็จก่อน',
            { statusCode: 409, code: 'LESSON_LOCKED' }
        ));

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(125);
        });
        await expectInteractiveModal('คำถามที่ถูกล็อกฝั่ง backend');

        await user.click(screen.getByRole('button', { name: 'คำตอบ A' }));
        await user.click(screen.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }));

        expect(await screen.findByText('กรุณาเรียนบทก่อนหน้าให้เสร็จก่อน')).toBeInTheDocument();
        expect(screen.getAllByText('คำถามที่ถูกล็อกฝั่ง backend').length).toBeGreaterThan(1);
    });

    it('does not show the page notice when the backend rejects lesson completion with LESSON_LOCKED', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 600, isCompleted: false },
                    interactiveQuestions: [],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.markLessonComplete.mockRejectedValue(new ApiError(
            'กรุณาเรียนบทก่อนหน้าให้เสร็จก่อน',
            { statusCode: 409, code: 'LESSON_LOCKED' }
        ));

        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(600);
        });
        fireEvent.click(screen.getByRole('button', { name: 'บันทึกว่าจบบทเรียน' }));

        await waitFor(() => {
            expect(testState.api.markLessonComplete).toHaveBeenCalledWith(12, 1);
        });
        expect(screen.getByText('กรุณาเรียนบทก่อนหน้าให้เสร็จก่อน')).toBeInTheDocument();
    });

    it('keeps modal state stable while lesson progress refresh updates the same lesson snapshot', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 61,
                            lessonId: 1,
                            questionText: 'คำถามที่ต้องไม่รีเซ็ตตอน sync progress',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(125);
        });
        await expectInteractiveModal('คำถามที่ต้องไม่รีเซ็ตตอน sync progress');

        const answerOption = screen.getByRole('button', { name: 'คำตอบ A' });
        await user.click(answerOption);
        expect(answerOption).toHaveAttribute('aria-pressed', 'true');

        act(() => {
            advancePlaybackClock(5);
            emitTimeUpdate(130);
        });

        await waitFor(() => {
            expect(testState.api.updateLessonProgress).toHaveBeenCalled();
        });
        expect(screen.getByRole('button', { name: 'คำตอบ A' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' })).toBeInTheDocument();
    });

    it('keeps the latest watched time when progress responses resolve out of order', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    interactiveQuestions: [],
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);
        testState.api.updateLessonProgress
            .mockImplementationOnce(() => new Promise(() => undefined))
            .mockImplementationOnce(() => new Promise(() => undefined))
            .mockResolvedValue({
                lastWatchedSeconds: 135,
                isCompleted: false,
            });

        const { unmount } = render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(0);
        });
        act(() => {
            advancePlaybackClock(130);
            emitTimeUpdate(130);
        });
        act(() => {
            advancePlaybackClock(5);
            emitTimeUpdate(135);
        });

        unmount();

        await waitFor(() => {
            expect(testState.api.updateLessonProgress).toHaveBeenLastCalledWith(1, 135);
        });
    });

    it('follows the backend current lesson after completing the current lesson', async () => {
        const initialCourse = createLearningCourseFixture({
            currentLessonId: 1,
            lastAccessedLessonId: 1,
            lessons: [
                createLessonFixture({
                    id: 1,
                    title: 'บทเรียนแรก',
                    sequenceOrder: 1,
                    interactiveQuestions: [],
                    progress: { lastWatchedSeconds: 590, isCompleted: false },
                }),
                createLessonFixture({
                    id: 2,
                    title: 'บทเรียนถัดไป',
                    sequenceOrder: 2,
                    interactiveQuestions: [],
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                }),
            ],
        });
        const reloadedCourse = createLearningCourseFixture({
            currentLessonId: 2,
            lastAccessedLessonId: 2,
            completedLessons: [1],
            progressPercent: 50,
            lessons: [
                createLessonFixture({
                    id: 1,
                    title: 'บทเรียนแรก',
                    sequenceOrder: 1,
                    status: 'completed',
                    interactiveQuestions: [],
                    progress: { lastWatchedSeconds: 600, isCompleted: true },
                }),
                createLessonFixture({
                    id: 2,
                    title: 'บทเรียนถัดไป',
                    sequenceOrder: 2,
                    interactiveQuestions: [],
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                }),
            ],
        });
        testState.api.getCourseLearning
            .mockResolvedValueOnce(initialCourse)
            .mockResolvedValue(reloadedCourse);

        render(<CourseLearningArea />);

        expect(await screen.findByRole('heading', { name: 'บทเรียนแรก' })).toBeInTheDocument();
        act(() => {
            emitInitialPosition(590);
            testState.player.props?.onEnded?.();
        });

        await waitFor(() => {
            expect(testState.api.markLessonComplete).toHaveBeenCalledWith(12, 1);
        });
        expect(await screen.findByRole('heading', { name: 'บทเรียนถัดไป' })).toBeInTheDocument();
    });

    it('shows watch progress percentages in the remaining progress surfaces after removing the lesson progress bar', async () => {
        const course = createLearningCourseFixture({
            progressPercent: 0,
            lessons: [
                createLessonFixture({
                    id: 1,
                    title: 'บทเรียนแรก',
                    sequenceOrder: 1,
                    progress: { lastWatchedSeconds: 300, isCompleted: false },
                    interactiveQuestions: [],
                }),
                createLessonFixture({
                    id: 2,
                    title: 'บทเรียนที่สอง',
                    sequenceOrder: 2,
                    progress: { lastWatchedSeconds: 0, isCompleted: false },
                    interactiveQuestions: [],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByRole('heading', { name: 'บทเรียนแรก' })).toBeInTheDocument();
        expect(screen.getByText('ความคืบหน้า')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();
        expect(screen.getByText('จบแล้ว 0/2 บท (0%)')).toBeInTheDocument();
        expect(screen.getByText('ดูไปแล้ว 5:00 (50%)')).toBeInTheDocument();
        expect(screen.queryByText('ความคืบหน้าบทเรียน')).not.toBeInTheDocument();
    });

    it('shows the incomplete lesson status without rendering the completion button until the lesson is watched to the end', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    progress: { lastWatchedSeconds: 590, isCompleted: false },
                    interactiveQuestions: [],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(590);
        });

        expect(screen.getByText('ต้องดูวิดีโอให้จบก่อน')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'ต้องดูวิดีโอให้จบก่อน' })).not.toBeInTheDocument();
        expect(testState.api.markLessonComplete).not.toHaveBeenCalled();
    });

    it.skip('resets interactive modal state when switching to another lesson after the current prompt is completed', async () => {
        const course = createLearningCourseFixture({
            lessons: [
                createLessonFixture({
                    id: 1,
                    title: 'บทเรียนแรก',
                    sequenceOrder: 1,
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 71,
                            lessonId: 1,
                            questionText: 'คำถามของบทเรียนแรก',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
                createLessonFixture({
                    id: 2,
                    title: 'บทเรียนที่สอง',
                    sequenceOrder: 2,
                    progress: { lastWatchedSeconds: 125, isCompleted: false },
                    interactiveQuestions: [
                        createInteractiveQuestionFixture({
                            id: 72,
                            lessonId: 2,
                            questionText: 'คำถามของบทเรียนที่สอง',
                            displayAtSeconds: 120,
                        }),
                    ],
                }),
            ],
        });
        testState.api.getCourseLearning.mockResolvedValue(course);

        const user = userEvent.setup();
        render(<CourseLearningArea />);

        expect(await screen.findByTestId('mock-vimeo-player')).toBeInTheDocument();
        act(() => {
            emitInitialPosition(125);
        });
        await expectInteractiveModal('คำถามของบทเรียนแรก');

        await user.click(screen.getByRole('button', { name: 'คำตอบ A' }));
        expect(screen.getByRole('button', { name: 'คำตอบ A' })).toHaveAttribute('aria-pressed', 'true');
        await user.click(screen.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }));
        await waitFor(() => {
            expect(testState.api.submitVideoQuestionAnswer).toHaveBeenCalledWith(71, 'option-a');
        });
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' })).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /2\.\s*บทเรียนที่สอง/ }));
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'บทเรียนที่สอง' })).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(testState.player.props?.title).toBe('บทเรียนที่สอง');
            expect(testState.player.props?.resumeAt).toBe(125);
        });
        act(() => {
            emitInitialPosition(125);
        });

        await expectInteractiveModal('คำถามของบทเรียนที่สอง');
        expect(screen.getByRole('button', { name: 'คำตอบ A' })).toHaveAttribute('aria-pressed', 'false');
    });

});
