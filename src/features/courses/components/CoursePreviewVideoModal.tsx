'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { VimeoLessonPlayer } from '@/features/learning/components/VimeoLessonPlayer';

interface CoursePreviewVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    playbackUrl: string;
    title: string;
}

export function CoursePreviewVideoModal({
    isOpen,
    onClose,
    playbackUrl,
    title,
}: CoursePreviewVideoModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                    aria-label="ปิดตัวอย่างวิดีโอ"
                >
                    <X size={18} />
                </button>
                <div className="aspect-video w-full">
                    <VimeoLessonPlayer
                        playbackUrl={playbackUrl}
                        title={title}
                        onTimeUpdate={() => undefined}
                        onSeeked={() => undefined}
                        onPause={() => undefined}
                        onEnded={() => undefined}
                    />
                </div>
            </div>
        </div>
    );
}
