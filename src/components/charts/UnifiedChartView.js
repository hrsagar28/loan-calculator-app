import React, { useState, useMemo } from 'react';
import LoanBreakdownChart from './LoanBreakdownChart';
import BalanceDeclineChart from './BalanceDeclineChart';
import CumulativeChart from './CumulativeChart';

const UnifiedChartView = ({ results, formatCurrency, loanAmount }) => {
    const [activeChart, setActiveChart] = useState('breakdown'); // 'breakdown', 'balance', 'cumulative'

    const principal = useMemo(() => parseFloat(String(loanAmount).replace(/,/g, '')), [loanAmount]);

    // Determine the maximum value for the cumulative chart's Y-axis
    const cumulativeMax = Math.max(principal, results.totalInterest);

    const chartComponents = {
        breakdown: <LoanBreakdownChart principal={principal} interest={results.totalInterest} isVisible={true} />,
        balance: <BalanceDeclineChart schedule={results.monthlySchedule} isVisible={true} formatCurrency={formatCurrency} maxChartValue={principal} />,
        cumulative: <CumulativeChart schedule={results.monthlySchedule} isVisible={true} formatCurrency={formatCurrency} maxChartValue={cumulativeMax} />
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-center mb-4 border-b border-outline-variant flex-shrink-0">
                <button onClick={() => setActiveChart('breakdown')} className={`px-4 py-2 font-semibold border-b-2 ${activeChart === 'breakdown' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>Breakdown</button>
                <button onClick={() => setActiveChart('balance')} className={`px-4 py-2 font-semibold border-b-2 ${activeChart === 'balance' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>Balance Decline</button>
                <button onClick={() => setActiveChart('cumulative')} className={`px-4 py-2 font-semibold border-b-2 ${activeChart === 'cumulative' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>Cumulative</button>
            </div>
            <div className="flex-grow flex items-center justify-center">
                {chartComponents[activeChart]}
            </div>
        </div>
    );
};

export default UnifiedChartView;