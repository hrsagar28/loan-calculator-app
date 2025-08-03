import React, { useMemo, useRef } from 'react';
import ChartTooltip from './ChartTooltip';


const CumulativeChart = ({ schedule, isVisible, formatCurrency, maxChartValue }) => {
    const chartRef = useRef(null);

    const chartPaths = useMemo(() => {
        if (!schedule || schedule.length === 0 || !maxChartValue) return null;

        const createPath = (dataExtractor) => {
            if (maxChartValue === 0) return "0,100";
            return schedule.map((item, i) => {
                const x = schedule.length > 1 ? (i / (schedule.length - 1)) * 100 : 50;
                const y = 100 - (dataExtractor(item) / maxChartValue) * 100;
                return `${x},${y}`;
            }).join(' ');
        };

        return {
            principalPoints: createPath(item => item.cumulativePrincipal),
            interestPoints: createPath(item => item.cumulativeInterest),
        };
    }, [schedule, maxChartValue]);


    if (!chartPaths) return null;
    
    const formatTooltipContent = (dataPoint) => (
        `<div class="text-[0.8em] text-on-surface-variant">Month ${dataPoint.month}</div>
         <div class="font-bold text-primary">Principal: ${formatCurrency(dataPoint.cumulativePrincipal)}</div>
         <div class="font-bold text-tertiary">Interest: ${formatCurrency(dataPoint.cumulativeInterest)}</div>`
    );

    return (
        <div className="w-full relative">
            <h4 className="text-lg font-semibold text-center mb-2 text-on-surface font-display">Cumulative Paid</h4>
            <div className="relative">
                <svg ref={chartRef} viewBox="-15 -10 130 120" className="w-full h-56" preserveAspectRatio="xMidYMid meet">
                    <text x="50" y="110" textAnchor="middle" className="text-[8px] font-semibold fill-on-surface-variant">Months</text>
                    <text x="-5" y="50" textAnchor="middle" transform="rotate(-90, -5, 50)" className="text-[8px] font-semibold fill-on-surface-variant">Amount</text>

                    <g>
                        <defs>
                            <linearGradient id="cumulativePrincipalGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" className="stop-primary" stopOpacity="0.4"/>
                                <stop offset="100%" className="stop-primary" stopOpacity="0"/>
                            </linearGradient>
                            <linearGradient id="cumulativeInterestGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" className="stop-tertiary" stopOpacity="0.3"/>
                                <stop offset="100%" className="stop-tertiary" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <path d={`M 0,100 L ${chartPaths.interestPoints} L 100,100 Z`} fill="url(#cumulativeInterestGradient)" />
                        <path d={`M 0,100 L ${chartPaths.principalPoints} L 100,100 Z`} fill="url(#cumulativePrincipalGradient)" />
                        <polyline points={chartPaths.interestPoints} fill="none" className="stroke-tertiary opacity-50" strokeWidth="0.8" style={{ transition: 'stroke-dashoffset 1.5s var(--ease-expressive)', strokeDasharray: 300, strokeDashoffset: isVisible ? 0 : 300 }} />
                        <polyline points={chartPaths.principalPoints} fill="none" className="stroke-primary" strokeWidth="0.8" style={{ transition: 'stroke-dashoffset 1.2s var(--ease-expressive)', strokeDasharray: 300, strokeDashoffset: isVisible ? 0 : 300 }} />
                    </g>
                </svg>
                <ChartTooltip chartRef={chartRef} schedule={schedule} formatTooltipContent={formatTooltipContent} />
            </div>
        </div>
    );
};

export default CumulativeChart;