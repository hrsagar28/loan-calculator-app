import React, { useRef } from 'react';

const ChartTooltip = ({ chartRef, schedule, formatTooltipContent }) => {
    const tooltipRef = useRef(null);

    const handleMouseLeave = () => {
        if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '0';
        }
    };

    const handleMouseMove = (e) => {
        if (!chartRef.current || !tooltipRef.current) return;
        const svg = chartRef.current;
        const tooltip = tooltipRef.current;
        const chartContainer = svg.parentElement;
        if (!chartContainer) return;

        const containerRect = chartContainer.getBoundingClientRect();
        
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        // Check if cursor is within the actual chart drawing area (0-100 coordinate space)
        if (cursorPoint.x >= 0 && cursorPoint.x <= 100 && cursorPoint.y >= 0 && cursorPoint.y <= 100) {
            const monthIndex = Math.min(schedule.length - 1, Math.max(0, Math.round((cursorPoint.x / 100) * (schedule.length - 1))));
            const dataPoint = schedule[monthIndex];

            if (dataPoint) {
                tooltip.style.opacity = '1';
                tooltip.style.left = `${mouseX + 15}px`;
                tooltip.style.top = `${mouseY - 30}px`;
                tooltip.innerHTML = formatTooltipContent(dataPoint);
            }
        } else {
            // If outside the drawing area, hide the tooltip
            handleMouseLeave();
        }
    };

    return (
        <div
            className="absolute inset-0"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div ref={tooltipRef} className="absolute top-0 left-0 p-2 rounded-lg shadow-lg bg-surface-container-high pointer-events-none transition-opacity opacity-0 z-10"></div>
        </div>
    );
};

export default ChartTooltip;