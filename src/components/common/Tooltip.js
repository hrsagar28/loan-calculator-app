import React, { useState, useMemo } from 'react';

const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    // Using a unique ID for ARIA accessibility
    const tooltipId = useMemo(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`, []);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    // Clone the child element to add the necessary event handlers and ARIA attributes
    const childWithHandlers = React.cloneElement(children, {
        'aria-describedby': tooltipId,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
    });

    return (
        <div className="relative flex items-center">
            {childWithHandlers}
            <div
                id={tooltipId}
                role="tooltip"
                className={`absolute bottom-full right-0 mb-2 w-max max-w-xs p-2 text-[0.8em] font-medium rounded-md shadow-lg transition-opacity duration-300 z-50 bg-primary text-on-primary ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {text}
            </div>
        </div>
    );
};

export default Tooltip;
