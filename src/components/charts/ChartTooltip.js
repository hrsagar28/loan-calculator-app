import React, { useRef } from 'react';

const ChartTooltip = ({ chartRef, schedule, formatTooltipContent }) => {
    const tooltipRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!chartRef.current || !tooltipRef.current) return;
        const svg = chartRef.current;
        const tooltip = tooltipRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        const monthIndex = Math.min(schedule.length - 1, Math.max(0, Math.round((cursorPoint.x / 100) * (schedule.length - 1))));
        const dataPoint = schedule[monthIndex];

        if (dataPoint) {
            tooltip.style.opacity = '1';
            tooltip.style.transform = `translate(${e.offsetX + 15}px, ${e.offsetY - 30}px)`;
            tooltip.innerHTML = formatTooltipContent(dataPoint);
        }
    };

    const handleMouseLeave = () => {
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
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