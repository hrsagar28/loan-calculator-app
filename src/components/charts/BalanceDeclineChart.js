import React, { useRef } from 'react';

const BalanceDeclineChart = ({ schedule, isVisible, formatCurrency, maxChartValue }) => {
    const chartRef = useRef(null);
    const tooltipRef = useRef(null);
    if (!schedule || schedule.length === 0 || !maxChartValue) return null;

    const points = schedule.map((item, i) => `${schedule.length > 1 ? (i / (schedule.length - 1)) * 100 : 50},${100 - (item.endingBalance / maxChartValue) * 100}`).join(' ');

    const handleMouseMove = (e) => {
        if (!chartRef.current || !tooltipRef.current) return;
        const svg = chartRef.current;
        const tooltip = tooltipRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        const monthIndex = Math.round((cursorPoint.x / 100) * (schedule.length - 1));
        const dataPoint = schedule[monthIndex];

        if(dataPoint) {
            tooltip.style.opacity = '1';
            tooltip.style.transform = `translate(${e.offsetX + 15}px, ${e.offsetY}px)`;
            tooltip.innerHTML = `<div class="text-[0.8em] text-on-surface-variant">Month ${dataPoint.month}</div><div class="font-bold text-on-surface">${formatCurrency(dataPoint.endingBalance)}</div>`;
        }
    };

    const handleMouseLeave = () => { if (tooltipRef.current) tooltipRef.current.style.opacity = '0'; };

    return (
        <div className="w-full relative">
            <h4 className="text-lg font-semibold text-center mb-2 text-on-surface font-display">Loan Balance</h4>
            <div className="relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <svg ref={chartRef} viewBox="-15 -10 130 120" className="w-full h-56" preserveAspectRatio="xMidYMid meet">
                    <text x="50" y="110" textAnchor="middle" className="text-[8px] font-semibold fill-on-surface-variant">Months</text>
                    <text x="-5" y="50" textAnchor="middle" transform="rotate(-90, -5, 50)" className="text-[8px] font-semibold fill-on-surface-variant">Amount</text>

                    <g>
                        <path d={`M 0,100 L ${points} L 100,100 Z`} fill="url(#balanceGradient)" />
                        <polyline points={points} fill="none" className="stroke-primary" strokeWidth="0.8" style={{ transition: 'stroke-dashoffset 1.5s var(--ease-expressive)', strokeDasharray: 300, strokeDashoffset: isVisible ? 0 : 300 }} />
                    </g>
                    <defs>
                        <linearGradient id="balanceGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" className="stop-primary" stopOpacity="0.4"/>
                            <stop offset="100%" className="stop-primary" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                </svg>
                <div ref={tooltipRef} className="absolute top-0 left-0 p-2 rounded-lg shadow-lg bg-surface-container-high pointer-events-none transition-opacity opacity-0 z-10"></div>
            </div>
        </div>
    );
};

export default BalanceDeclineChart;
