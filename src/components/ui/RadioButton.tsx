/**
 * RadioButton Component
 * Reusable radio button with custom styling
 * Extracted from CheckoutArea.tsx for SOLID SRP compliance
 */

import React from 'react';

interface RadioButtonProps {
    checked: boolean;
    onChange: () => void;
    label: string;
    sublabel?: React.ReactNode;
    name: string;
    size?: 'sm' | 'md';
}

const RadioButton: React.FC<RadioButtonProps> = ({
    checked,
    onChange,
    label,
    sublabel,
    name,
    size = 'md',
}) => {
    const circleSize = size === 'sm' ? 24 : 28;
    const dotSize = size === 'sm' ? 8 : 10;
    const padding = size === 'sm' ? '14px 20px' : '16px 20px';
    const fontSize = size === 'sm' ? '15px' : '16px';

    return (
        <label
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding,
                border: checked ? '2px solid #014D40' : '1px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                background: '#fff',
                height: size === 'md' ? '80px' : 'auto',
            }}
        >
            {/* Radio circle indicator */}
            <div
                style={{
                    width: `${circleSize}px`,
                    height: `${circleSize}px`,
                    borderRadius: '50%',
                    background: checked ? '#014D40' : '#fff',
                    border: checked ? 'none' : '2px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                {checked && (
                    <div
                        style={{
                            width: `${dotSize}px`,
                            height: `${dotSize}px`,
                            borderRadius: '50%',
                            background: '#fff'
                        }}
                    />
                )}
            </div>

            {/* Label content */}
            <div>
                <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize }}>
                    {label}
                </p>
                {sublabel && <div style={{ marginTop: '6px' }}>{sublabel}</div>}
            </div>

            {/* Hidden native radio input */}
            <input
                type="radio"
                name={name}
                checked={checked}
                onChange={onChange}
                style={{ display: 'none' }}
            />
        </label>
    );
};

export default RadioButton;
