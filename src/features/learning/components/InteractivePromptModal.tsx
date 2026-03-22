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
                    className="pointer-events-auto my-auto isolate flex w-full max-w-xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 outline-none"
                    data-testid="interactive-prompt-dialog"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <div className="border-b border-slate-100 bg-gradient-to-r from-[#004736] to-[#006650] px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white/80">Interactive ระหว่างเรียน</p>
                                <p className="text-xs text-white/50">ส่งคำตอบเพื่อเรียนต่อ ระบบจะไม่คิดคะแนนและไม่แสดงถูกหรือผิด</p>
                            </div>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                        <h3 id="interactive-modal-title" className="text-xl font-bold text-slate-900">
                            {question.questionText}
                        </h3>
                        <p id="interactive-modal-description" className="mt-1.5 text-sm text-slate-400">
                            เลือกคำตอบแล้วกดส่งเพื่อเรียนต่อ
                        </p>

                        <div className="mt-5">
                        {question.questionType === 'SHORT_ANSWER' ? (
                            <textarea
                                value={writtenAnswer}
                                onChange={(event) => onWrittenAnswerChange(event.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-[#004736] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004736]/20"
                                placeholder="พิมพ์คำตอบของคุณ"
                            />
                        ) : (
                            <div className="space-y-2.5">
                                {question.options.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => onSelectOption(option.id)}
                                        aria-pressed={selectedOptionId === option.id}
                                        className={`relative z-[1] w-full cursor-pointer rounded-xl border-2 px-4 py-3.5 text-left transition-all pointer-events-auto select-none ${
                                            selectedOptionId === option.id
                                                ? 'border-[#004736] bg-[#edf7f4] text-slate-900 shadow-sm shadow-[#004736]/10'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                        data-testid={`interactive-option-${option.id}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                                selectedOptionId === option.id
                                                    ? 'border-[#004736] bg-[#004736]'
                                                    : 'border-slate-300'
                                            }`}>
                                                {selectedOptionId === option.id && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium">{option.text}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>

                        {submitError && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                {submitError}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                        <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-gradient-to-r from-[#004736] to-[#006650] px-5 py-3 font-semibold text-white shadow-md shadow-[#004736]/20 pointer-events-auto transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
