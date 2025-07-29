import React, { useEffect, useRef } from 'react';

const Card = ({ children, className = '', animated = false, delay = 0, isVisible = true }) => {
    const cardRef = useRef(null);
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };
        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return (
        <div
            ref={cardRef}
            className={`bg-surface border-glass shadow-glass glass-effect card-glow-effect relative rounded-2xl transition-colors duration-300 ${className} ${animated ? (isVisible ? 'animate-cascade-in' : 'opacity-0') : ''}`}
            style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
        >
          {children}
        </div>
    );
};

export default Card;
