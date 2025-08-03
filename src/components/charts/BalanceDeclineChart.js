import React, { useMemo, useRef } from 'react';
import ChartTooltip from './ChartTooltip';

const BalanceDeclineChart = ({ schedule, isVisible, formatCurrency, maxChartValue }) => {
    const chartRef = useRef(null);

    const chartData = useMemo(() => {
        if (!schedule || schedule.length === 0 || !maxChartValue) return null;
        const points = schedule.map((item, i) => `${schedule.length > 1 ? (i / (schedule.length - 1)) * 100 : 50},${100 - (item.endingBalance / maxChartValue) * 100}`).join(' ');
        return { points };
    }, [schedule, maxChartValue]);


    if (!chartData) return null;

    const formatTooltipContent = (dataPoint) => (
        `<div class="text-[0.8em] text-on-surface-variant">Month ${dataPoint.month}</div><div class="font-bold text-on-surface">${formatCurrency(dataPoint.endingBalance)}</div>`
    );

    return (
        <div className="w-full relative">
            <h4 className="text-lg font-semibold text-center mb-2 text-on-surface font-display">Loan Balance</h4>
            <div className="relative">
                <svg ref={chartRef} viewBox="-15 -10 130 120" className="w-full h-56" preserveAspectRatio="xMidYMid meet">
                    <text x="50" y="110" textAnchor="middle" className="text-[8px] font-semibold fill-on-surface-variant">Months</text>
                    <text x="-5" y="50" textAnchor="middle" transform="rotate(-90, -5, 50)" className="text-[8px] font-semibold fill-on-surface-variant">Amount</text>

                    <g>
                        <path d={`M 0,100 L ${chartData.points} L 100,100 Z`} fill="url(#balanceGradient)" />
                        <polyline points={chartData.points} fill="none" className="stroke-primary" strokeWidth="0.8" style={{ transition: 'stroke-dashoffset 1.5s var(--ease-expressive)', strokeDasharray: 300, strokeDashoffset: isVisible ? 0 : 300 }} />
                    </g>
                    <defs>
                        <linearGradient id="balanceGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" className="stop-primary" stopOpacity="0.4"/>
                            <stop offset="100%" className="stop-primary" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                </svg>
                <ChartTooltip chartRef={chartRef} schedule={schedule} formatTooltipContent={formatTooltipContent} />
            </div>
        </div>
    );
};

export default BalanceDeclineChart;