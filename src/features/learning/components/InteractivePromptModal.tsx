'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { LearningInteractiveQuestion } from '../types';

interface InteractivePromptModalProps {
    question: LearningInteractiveQuestion | null;
    selectedOptionId: string;
    writtenAnswer: string;
    submitError: string;
    isSubmitting: boolean;
    onSelectOption: (value: string) => void;
    onWrittenAnswerChange: (value: string) => void;
    onSubmit: () => void;
}

function getFocusableElements(container: HTMLElement | null) {
    if (!container) {
        return [] as HTMLElement[];
    }

    return Array.from(
        container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    );
}

export function InteractivePromptModal({
    question,
    selectedOptionId,
    writtenAnswer,
    submitError,
    isSubmitting,
    onSelectOption,
    onWrittenAnswerChange,
    onSubmit,
}: InteractivePromptModalProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const previousActiveElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!question || typeof document === 'undefined') {
            return;
        }

        previousActiveElementRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        previousActiveElementRef.current?.blur?.();

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.setAttribute('data-interactive-modal-open', 'true');

        const focusFirstElement = () => {
            const firstFocusableElement = getFocusableElements(dialogRef.current)[0];
            if (firstFocusableElement) {
                firstFocusableElement.focus();
                return;
            }

            dialogRef.current?.focus();
        };

        const animationFrameId = window.requestAnimationFrame(focusFirstElement);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusableElements = getFocusableElements(dialogRef.current);
            if (focusableElements.length === 0) {
                event.preventDefault();
                dialogRef.current?.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

            if (event.shiftKey) {
                if (!activeElement || activeElement === firstElement || !dialogRef.current?.contains(activeElement)) {
                    event.preventDefault();
                    lastElement.focus();
                }
                return;
            }

            if (!activeElement || activeElement === lastElement || !dialogRef.current?.contains(activeElement)) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.removeAttribute('data-interactive-modal-open');
            previousActiveElementRef.current?.focus?.();
        };
    }, [question]);

    if (!question || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[2147483647] overflow-y-auto bg-black/60 px-4 py-4 pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="interactive-modal-title"
            aria-describedby="interactive-modal-description"
            data-testid="interactive-prompt-modal"
        >
            <div className="flex min-h-full items-start justify-center md:items-center">
                <div
                    ref={dialogRef}
                    tabIndex={-1}
                    className="pointer-events-auto my-auto isolate flex w-full max-w-xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl outline-none"
                    data-testid="interactive-prompt-dialog"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-[#004736]">Interactive ระหว่างเรียน</p>
                            <h3 id="interactive-modal-title" className="mt-1 text-2xl font-bold text-slate-900">
                                {question.questionText}
                            </h3>
                            <p id="interactive-modal-description" className="mt-2 text-sm text-slate-500">
                                ส่งคำตอบเพื่อเรียนต่อ ระบบจะไม่คิดคะแนนและไม่แสดงถูกหรือผิด
                            </p>
                        </div>

                        {question.questionType === 'SHORT_ANSWER' ? (
                            <textarea
                                value={writtenAnswer}
                                onChange={(event) => onWrittenAnswerChange(event.target.value)}
                                rows={4}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004736]"
                                placeholder="พิมพ์คำตอบของคุณ"
                            />
                        ) : (
                            <div className="space-y-3">
                                {question.options.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onSelectOption(option.id)}
                                        aria-pressed={selectedOptionId === option.id}
                                        className={`relative z-[1] w-full cursor-pointer rounded-2xl border px-4 py-4 text-left transition pointer-events-auto select-none ${
                                            selectedOptionId === option.id
                                                ? 'border-[#004736] bg-[#edf7f4] text-slate-900'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                        }`}
                                        data-testid={`interactive-option-${option.id}`}
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {submitError && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {submitError}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
                        <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-[#004736] px-5 py-3 font-semibold text-white pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            data-testid="interactive-submit-button"
                        >
                            {isSubmitting ? 'กำลังส่งคำตอบ...' : 'ส่งคำตอบเพื่อเรียนต่อ'}
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
