import React, { useMemo } from 'react';

const LoanBreakdownChart = ({ principal, interest, isVisible }) => {
    const chartData = useMemo(() => {
        const total = principal + interest;
        if (total === 0) return null;
        const pPct = principal / total;
        return { pPct };
    }, [principal, interest]);

    if (!chartData) {
        return <div className="flex items-center justify-center h-full text-on-surface-variant">No data for chart.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h4 className="text-lg font-semibold text-center mb-2 text-on-surface font-display">Principal vs Interest</h4>
            <div className="relative w-52 h-52">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r="15.915" className="stroke-current text-surface-container-highest" strokeWidth="4" fill="transparent" />
                    <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        className="stroke-tertiary"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="100, 100"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                    <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        className="stroke-primary"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={isVisible ? `${chartData.pPct * 100}, 100` : '0, 100'}
                        style={{ transition: 'stroke-dasharray 1.2s var(--ease-expressive)', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[0.8em] text-on-surface-variant">Principal</span>
                    <span className="text-[1.75em] font-bold text-on-surface font-display">{(chartData.pPct * 100).toFixed(1)}%</span>
                </div>
            </div>
            <div className="mt-4 w-full flex justify-center space-x-4 text-[0.8em] text-on-surface-variant">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-primary"></span>Principal</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-tertiary"></span>Interest</div>
            </div>
        </div>
    );
};

export default LoanBreakdownChart;