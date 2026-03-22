import { expect, test } from '@playwright/test';

const CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-headers': 'Authorization,Content-Type',
};

function createLearningLessonData(overrides: {
    id: number;
    title: string;
    sequenceOrder: number;
    question: {
        id: number;
        questionText: string;
        questionType?: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
        displayAtSeconds?: number;
        options?: Array<{ id: string; text: string }>;
        answered?: boolean;
    };
    progressSeconds?: number;
    videoId?: number;
    resourceId?: string;
    playbackUrl?: string;
}) {
    return {
        id: overrides.id,
        title: overrides.title,
        sequenceOrder: overrides.sequenceOrder,
        status: 'available',
        video: {
            id: overrides.videoId ?? overrides.id,
            provider: 'VIMEO',
            resourceId: overrides.resourceId ?? String(1175386748 + overrides.id),
            duration: 600,
            name: `${overrides.title} video`,
            status: 'READY',
            playbackUrl: overrides.playbackUrl ?? `https://player.vimeo.com/video/${1175386748 + overrides.id}?h=testhash${overrides.id}`,
        },
        documents: [],
        interactiveQuestions: [
            {
                id: overrides.question.id,
                lessonId: overrides.id,
                questionText: overrides.question.questionText,
                questionType: overrides.question.questionType ?? 'MULTIPLE_CHOICE',
                displayAtSeconds: overrides.question.displayAtSeconds ?? 120,
                sortOrder: 1,
                options: overrides.question.options ?? [
                    { id: 'option-a', text: 'คำตอบ A' },
                    { id: 'option-b', text: 'คำตอบ B' },
                ],
                answered: overrides.question.answered ?? false,
            },
        ],
        lessonQuiz: null,
        progress: {
            lastWatchedSeconds: overrides.progressSeconds ?? 125,
            isCompleted: false,
        },
    };
}

function createLearningCourseData(questionOverrides: {
    id: number;
    questionText: string;
    questionType?: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
    displayAtSeconds?: number;
    options?: Array<{ id: string; text: string }>;
    progressSeconds?: number;
}) {
    return {
        id: 12,
        title: 'คอร์สตัวอย่าง',
        description: 'คำอธิบายคอร์ส',
        authorName: 'อาจารย์ตัวอย่าง',
        thumbnail: null,
        hasCertificate: false,
        cpeCredits: 0,
        enrolledAt: '2026-03-01T00:00:00.000Z',
        lastAccessedAt: '2026-03-01T00:00:00.000Z',
        watchPercent: 0,
        completionPercent: 0,
        progressPercent: 0,
        completedLessons: [],
        lastAccessedLessonId: 1,
        currentLessonId: 1,
        lessons: [
            createLearningLessonData({
                id: 1,
                title: 'บทเรียนตัวอย่าง',
                sequenceOrder: 1,
                progressSeconds: questionOverrides.progressSeconds ?? 125,
                resourceId: '1175386748',
                playbackUrl: 'https://player.vimeo.com/video/1175386748?h=testhash',
                question: {
                    id: questionOverrides.id,
                    questionText: questionOverrides.questionText,
                    questionType: questionOverrides.questionType,
                    displayAtSeconds: questionOverrides.displayAtSeconds,
                    options: questionOverrides.options,
                },
            }),
        ],
    };
}

async function installMockPlayer(page: import('@playwright/test').Page) {
    await page.addInitScript(() => {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('token', 'playwright-token');
        sessionStorage.removeItem('token');

        (window as any).__PHARMACY_TEST_PLAYER_CLICKS__ = 0;
        (window as any).__PHARMACY_TEST_VIMEO_PLAYER__ = class MockPlayer {
            private handlers: Record<string, (payload?: { seconds?: number; duration?: number }) => void> = {};
            private currentTime = 0;
            private surface: HTMLIFrameElement | null = null;

            constructor(container: HTMLElement) {
                const surface = document.createElement('iframe');
                surface.srcdoc = '<!doctype html><html><body style="margin:0;background:#020617;"></body></html>';
                surface.setAttribute('data-testid', 'playwright-mock-player-surface');
                surface.setAttribute('aria-label', 'playwright mock player surface');
                surface.style.width = '100%';
                surface.style.height = '100%';
                surface.style.display = 'block';
                surface.style.border = '0';
                surface.style.background = 'transparent';
                surface.addEventListener('click', () => {
                    (window as any).__PHARMACY_TEST_PLAYER_CLICKS__ += 1;
                });

                container.innerHTML = '';
                container.appendChild(surface);
                this.surface = surface;
            }

            on(event: string, callback: (payload?: { seconds?: number; duration?: number }) => void) {
                this.handlers[event] = callback;
            }

            ready() {
                return Promise.resolve();
            }

            play() {
                return Promise.resolve();
            }

            pause() {
                this.handlers.pause?.({ seconds: this.currentTime, duration: 600 });
                return Promise.resolve();
            }

            destroy() {
                this.surface?.remove();
                return Promise.resolve();
            }

            setCurrentTime(seconds: number) {
                this.currentTime = seconds;
                return Promise.resolve(seconds);
            }

            getDuration() {
                return Promise.resolve(600);
            }
        };
    });
}

async function mockLearningApis(
    page: import('@playwright/test').Page,
    courseData: ReturnType<typeof createLearningCourseData>,
    trackers: {
        submittedAnswers: string[];
        progressUpdates: number[];
        completions: number;
    }
) {
    await page.route('**/api/auth/me', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({
                status: 204,
                headers: CORS_HEADERS,
            });
            return;
        }

        await route.fulfill({
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                user: {
                    id: 99,
                    fullName: 'Playwright User',
                    email: 'playwright@example.com',
                    role: 'general',
                },
            }),
        });
    });

    await page.route('**/api/v1/courses/12/learning', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({
                status: 204,
                headers: CORS_HEADERS,
            });
            return;
        }

        await route.fulfill({
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                data: courseData,
            }),
        });
    });

    await page.route('**/api/v1/video-questions/*/answer', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({
                status: 204,
                headers: CORS_HEADERS,
            });
            return;
        }

        const payload = route.request().postDataJSON() as { answerGiven?: string };
        const match = new URL(route.request().url()).pathname.match(/video-questions\/(\d+)\/answer/);
        const questionId = Number(match?.[1] ?? 0);
        trackers.submittedAnswers.push(payload.answerGiven ?? '');

        await route.fulfill({
            status: 201,
            headers: {
                ...CORS_HEADERS,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    id: 1,
                    videoQuestionId: questionId,
                    answerGiven: payload.answerGiven ?? '',
                    answered: true,
                    updatedAt: '2026-03-21T00:00:00.000Z',
                },
            }),
        });
    });

    await page.route('**/api/v1/lessons/*/progress', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({
                status: 204,
                headers: CORS_HEADERS,
            });
            return;
        }

        const payload = route.request().postDataJSON?.() as { lastWatchedSeconds?: number } | undefined;
        trackers.progressUpdates.push(payload?.lastWatchedSeconds ?? -1);

        await route.fulfill({
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    lastWatchedSeconds: payload?.lastWatchedSeconds ?? 0,
                    isCompleted: false,
                },
            }),
        });
    });

    await page.route('**/api/v1/courses/12/lessons/*/complete', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({
                status: 204,
                headers: CORS_HEADERS,
            });
            return;
        }

        const match = new URL(route.request().url()).pathname.match(/lessons\/(\d+)\/complete/);
        const lessonId = Number(match?.[1] ?? 1);
        trackers.completions += 1;
        await route.fulfill({
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    lessonId,
                    isCompleted: true,
                    progressPercent: 100,
                },
            }),
        });
    });
}

test.describe('interactive modal browser regression', () => {
    test.beforeEach(async ({ page }) => {
        await installMockPlayer(page);
    });

    test('keeps the submit action reachable on shorter viewports', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 620 });

        const trackers = {
            submittedAnswers: [] as string[],
            progressUpdates: [] as number[],
            completions: 0,
        };
        const courseData = createLearningCourseData({
            id: 100,
            questionText: 'คำถามที่ต้องส่งได้แม้จอเตี้ย',
        });

        await mockLearningApis(page, courseData, trackers);
        await page.goto('/course-learning?courseId=12');

        const modal = page.getByTestId('interactive-prompt-modal');
        const submitButton = modal.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' });
        await expect(modal).toBeVisible();
        await expect(submitButton).toBeVisible();

        await modal.getByRole('button', { name: 'คำตอบ A' }).click();
        await submitButton.click();

        await expect(modal).toHaveCount(0);
        expect(trackers.submittedAnswers).toEqual(['option-a']);
    });

    test('allows selecting and submitting a multiple choice answer while the player is isolated behind the modal', async ({ page }) => {
        const trackers = {
            submittedAnswers: [] as string[],
            progressUpdates: [] as number[],
            completions: 0,
        };
        const courseData = createLearningCourseData({
            id: 101,
            questionText: 'คำถาม browser regression',
        });

        await mockLearningApis(page, courseData, trackers);
        await page.goto('/course-learning?courseId=12');

        const modal = page.getByTestId('interactive-prompt-modal');
        await expect(modal).toBeVisible();
        await expect(modal.getByText('คำถาม browser regression')).toBeVisible();

        const playerWrapper = page.getByTestId('learning-player-wrapper');
        await expect(playerWrapper).toHaveAttribute('data-interaction-disabled', 'true');
        const playerSurface = page.getByTestId('playwright-mock-player-surface');
        await expect(playerSurface).toHaveCSS('pointer-events', 'none');
        await expect(playerSurface).toHaveAttribute('tabindex', '-1');

        await page.getByRole('button', { name: 'คำตอบ A' }).click();
        await page.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }).click();

        await expect(modal).toHaveCount(0);
        await expect(playerWrapper).toHaveAttribute('data-interaction-disabled', 'false');
        expect(trackers.submittedAnswers).toEqual(['option-a']);
        await expect(page.getByTestId('vimeo-player-interaction-blocker')).toHaveCount(0);
        await expect(playerSurface).not.toHaveAttribute('aria-hidden', 'true');
    });

    test('allows typing and submitting a short-answer interactive prompt', async ({ page }) => {
        const trackers = {
            submittedAnswers: [] as string[],
            progressUpdates: [] as number[],
            completions: 0,
        };
        const courseData = createLearningCourseData({
            id: 202,
            questionText: 'อธิบายแนวทางการดูแลผู้ป่วย',
            questionType: 'SHORT_ANSWER',
            options: [],
            progressSeconds: 45,
            displayAtSeconds: 30,
        });

        await mockLearningApis(page, courseData, trackers);
        await page.goto('/course-learning?courseId=12');

        const modal = page.getByTestId('interactive-prompt-modal');
        await expect(modal).toBeVisible();

        await page.getByPlaceholder('พิมพ์คำตอบของคุณ').fill('คำตอบจาก Playwright');
        await page.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }).click();

        await expect(modal).toHaveCount(0);
        expect(trackers.submittedAnswers).toEqual(['คำตอบจาก Playwright']);
    });

    test('resets modal selection state after switching to another lesson with its own interactive prompt', async ({ page }) => {
        const trackers = {
            submittedAnswers: [] as string[],
            progressUpdates: [] as number[],
            completions: 0,
        };
        const courseData = {
            id: 12,
            title: 'คอร์สตัวอย่าง',
            description: 'คำอธิบายคอร์ส',
            authorName: 'อาจารย์ตัวอย่าง',
            thumbnail: null,
            hasCertificate: false,
            cpeCredits: 0,
            enrolledAt: '2026-03-01T00:00:00.000Z',
            lastAccessedAt: '2026-03-01T00:00:00.000Z',
            watchPercent: 0,
            completionPercent: 0,
            progressPercent: 0,
            completedLessons: [],
            lastAccessedLessonId: 1,
            currentLessonId: 1,
            lessons: [
                createLearningLessonData({
                    id: 1,
                    title: 'บทเรียนแรก',
                    sequenceOrder: 1,
                    question: {
                        id: 301,
                        questionText: 'คำถามของบทเรียนแรก',
                    },
                }),
                createLearningLessonData({
                    id: 2,
                    title: 'บทเรียนที่สอง',
                    sequenceOrder: 2,
                    videoId: 2,
                    resourceId: '1175386750',
                    playbackUrl: 'https://player.vimeo.com/video/1175386750?h=testhash2',
                    question: {
                        id: 302,
                        questionText: 'คำถามของบทเรียนที่สอง',
                    },
                }),
            ],
        };

        await mockLearningApis(page, courseData, trackers);
        await page.goto('/course-learning?courseId=12');

        const modal = page.getByTestId('interactive-prompt-modal');
        await expect(modal).toBeVisible();
        await expect(modal.getByText('คำถามของบทเรียนแรก')).toBeVisible();

        const answerA = modal.getByRole('button', { name: 'คำตอบ A' });
        await answerA.click();
        await expect(answerA).toHaveAttribute('aria-pressed', 'true');
        await modal.getByRole('button', { name: 'ส่งคำตอบเพื่อเรียนต่อ' }).click();

        await expect(modal).toHaveCount(0);
        await expect(page.getByTestId('learning-player-wrapper')).toHaveAttribute('data-interaction-disabled', 'false');

        await page.getByRole('button', { name: /2\.\s*บทเรียนที่สอง/ }).click();
        await expect(page.getByRole('heading', { name: 'บทเรียนที่สอง' })).toBeVisible();
        await expect(modal).toBeVisible();
        await expect(modal.getByText('คำถามของบทเรียนที่สอง')).toBeVisible();
        await expect(modal.getByRole('button', { name: 'คำตอบ A' })).toHaveAttribute('aria-pressed', 'false');
    });

    test('renders locked lessons as disabled summaries without mounting locked lesson content', async ({ page }) => {
        const trackers = {
            submittedAnswers: [] as string[],
            progressUpdates: [] as number[],
            completions: 0,
        };
        const courseData = {
            id: 12,
            title: 'คอร์สตัวอย่าง',
            description: 'คำอธิบายคอร์ส',
            authorName: 'อาจารย์ตัวอย่าง',
            thumbnail: null,
            hasCertificate: false,
            cpeCredits: 0,
            enrolledAt: '2026-03-01T00:00:00.000Z',
            lastAccessedAt: '2026-03-01T00:00:00.000Z',
            watchPercent: 0,
            completionPercent: 0,
            progressPercent: 0,
            completedLessons: [],
            lastAccessedLessonId: 1,
            currentLessonId: 1,
            lessons: [
                {
                    id: 1,
                    title: 'บทเรียนที่พร้อมเรียน',
                    sequenceOrder: 1,
                    status: 'available',
                    video: {
                        id: 1,
                        provider: 'VIMEO',
                        resourceId: '1175386748',
                        duration: 600,
                        name: 'บทเรียนที่พร้อมเรียน video',
                        status: 'READY',
                        playbackUrl: 'https://player.vimeo.com/video/1175386748?h=testhash',
                    },
                    documents: [],
                    interactiveQuestions: [],
                    lessonQuiz: null,
                    progress: {
                        lastWatchedSeconds: 0,
                        isCompleted: false,
                    },
                },
                {
                    id: 2,
                    title: 'บทเรียนที่ยังล็อก',
                    sequenceOrder: 2,
                    status: 'locked',
                    video: null,
                    documents: [],
                    interactiveQuestions: [],
                    lessonQuiz: null,
                    progress: {
                        lastWatchedSeconds: 0,
                        isCompleted: false,
                    },
                },
            ],
        };

        await mockLearningApis(page, courseData as ReturnType<typeof createLearningCourseData>, trackers);
        await page.goto('/course-learning?courseId=12');

        await expect(page.getByRole('heading', { name: 'บทเรียนที่พร้อมเรียน' })).toBeVisible();
        await expect(page.getByTestId('playwright-mock-player-surface')).toHaveCount(1);
        await expect(page.getByRole('button', { name: /2\.\s*บทเรียนที่ยังล็อก/ })).toBeDisabled();
        await expect(page.getByText('บทเรียนที่ยังล็อก video')).toHaveCount(0);
        await expect(page.getByText('คำถามของบทที่ยังล็อก')).toHaveCount(0);
    });
});
