"use client"
import React from 'react';

interface CourseDescriptionProps {
    shortDescription: string;
    fullDescription: string;
    lessons: any[];
}

/**
 * Description Section Component
 */
export const DescriptionSection: React.FC<{
    shortDescription: string;
    fullDescription: string;
}> = ({ shortDescription, fullDescription }) => (
    <div className="description-section mb-5 p-0">
        {/* Short Description */}
        <div className="short-description mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-bookmark" style={{ fontSize: '24px', color: '#14b8a6', fontWeight: 'bold' }}></i>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>บทสรุพคอร์ส</h3>
            </div>
            <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#555',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                borderLeft: '4px solid #14b8a6',
                margin: 0
            }}>
                {shortDescription || 'ยังไม่มีบทสรุป'}
            </p>
        </div>

        {/* Full Description */}
        <div className="full-description">
            <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-book-open" style={{ fontSize: '24px', color: '#3b82f6', fontWeight: 'bold' }}></i>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>รายละเอียดคอร์ส</h3>
            </div>
            <div style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#555',
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6',
            }}>
                <div dangerouslySetInnerHTML={{
                    __html: fullDescription || 'ยังไม่มีรายละเอียด'
                }} />
            </div>
        </div>
    </div>
);

/**
 * Lessons Section Component
 */
export const LessonsSection: React.FC<{
    lessons: any[];
    title?: string;
}> = ({ lessons, title = 'เนื้อหาในบทเรียน' }) => {
    if (!lessons || lessons.length === 0) {
        return (
            <div className="lessons-section mb-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="fas fa-list-check" style={{ fontSize: '24px', color: '#f59e0b', fontWeight: 'bold' }}></i>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{title}</h3>
                </div>
                <p style={{ fontSize: '16px', color: '#999', fontStyle: 'italic' }}>ยังไม่มีบทเรียน</p>
            </div>
        );
    }

    const formatDuration = (seconds: number | null | undefined): string => {
        if (!seconds || seconds <= 0) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
        return `${minutes} นาที`;
    };

    return (
        <div className="lessons-section mb-5">
            <div className="d-flex align-items-center gap-2 mb-4">
                <i className="fas fa-list-check" style={{ fontSize: '24px', color: '#f59e0b', fontWeight: 'bold' }}></i>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {title} ({lessons.length} บท)
                </h3>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px'
            }}>
                {lessons.map((lesson, index) => (
                    <div
                        key={lesson.id || index}
                        style={{
                            padding: '16px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            borderLeft: '4px solid #f59e0b',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                {index + 1}
                            </div>
                            <div>
                                <h5 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333'
                                }}>
                                    {lesson.title || `บทเรียนที่ ${index + 1}`}
                                </h5>
                                {lesson.description && (
                                    <p style={{
                                        margin: '4px 0 0 0',
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>
                                        {lesson.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#666',
                            fontSize: '14px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                        }}>
                            <i className="fas fa-clock"></i>
                            <span>{formatDuration(lesson.video?.duration || lesson.duration)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
