import React, { useState, useRef, useCallback } from 'react';
import { icons } from '../../constants/icons';

const ExpressiveSlider = ({ min, max, step, value, onChange, disabled, icon: IconComponent, handleInteractiveClick = () => {} }) => {
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const Icon = icons[IconComponent];
    
    const getPercentage = useCallback((current) => ((current - min) / (max - min)) * 100, [min, max]);

    const handleInteraction = useCallback((e) => {
        if (!sliderRef.current || disabled) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const rawValue = (percentage / 100) * (max - min) + min;
        const newValue = Math.round(rawValue / step) * step;
        
        if (newValue !== value) {
            if (navigator.vibrate) navigator.vibrate(3);
            onChange(newValue);
        }
    }, [min, max, step, value, onChange, disabled]);

    const handleTouchStart = (e) => {
        if (disabled) return;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e) => {
        if (disabled) return;

        if (!isDragging) {
            const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
            const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
            if (deltaY > deltaX) return;
            handleInteractiveClick()();
            setIsDragging(true);
        }

        if (isDragging) {
            e.preventDefault();
            handleInteraction(e);
        }
    };
    
    const handleTouchEnd = () => {
        if (isDragging) setIsDragging(false);
    };

    const handleMouseDown = (e) => {
        if (disabled) return;
        handleInteractiveClick()(); 
        setIsDragging(true);
        e.preventDefault();
        handleInteraction(e);

        const handleMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            handleInteraction(moveEvent);
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleKeyDown = (e) => {
        if (disabled) return;
        let newValue = value;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') newValue = Math.min(max, value + step);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') newValue = Math.max(min, value - step);
        
        if (newValue !== value) {
            if (navigator.vibrate) navigator.vibrate(3);
            onChange(newValue);
        }
    };

    const percentage = getPercentage(value);

    return (
        <div>
            <label className="block font-medium mb-2 text-on-surface-variant">Loan Tenure</label>
            <div
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={`${value} years`}
                aria-label="Loan Tenure"
                className={`relative w-full h-14 flex items-center rounded-full bg-surface-container-highest cursor-pointer select-none touch-pan-y ${disabled ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
            >
                <div
                    className="absolute top-0 left-0 h-full rounded-full bg-primary flex items-center overflow-hidden"
                    style={{ width: `${percentage}%`, minWidth: '3.5rem', transition: isDragging ? 'none' : 'width 150ms ease-out' }}
                >
                    <div className="flex items-center gap-3 pl-5 text-on-primary flex-shrink-0 whitespace-nowrap">
                        {Icon && <Icon />}
                        <span className="font-bold">{value} Years</span>
                    </div>
                </div>
                 <div className="flex items-center gap-3 pl-5 text-on-surface-variant w-full pointer-events-none">
                    {Icon && <Icon />}
                    <span className="font-bold">{value} Years</span>
                </div>
                <div
                    className="absolute top-0 h-full w-1 bg-on-primary/50 transition-transform duration-300 ease-spring"
                    style={{
                        left: `${percentage}%`,
                        transform: `translateX(-50%) scaleY(${isDragging ? 1.2 : 1})`,
                        display: percentage > 1 && percentage < 99 ? 'block' : 'none'
                    }}
                ></div>
            </div>
        </div>
    );
};

export default ExpressiveSlider;