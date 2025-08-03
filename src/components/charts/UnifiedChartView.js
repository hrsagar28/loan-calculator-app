import React, { useState } from 'react';
import LoanBreakdownChart from './LoanBreakdownChart';
import BalanceDeclineChart from './BalanceDeclineChart';
import CumulativeChart from './CumulativeChart';

const UnifiedChartView = ({ results, formatCurrency, loanAmount }) => {
    const [activeChart, setActiveChart] = useState('breakdown'); // 'breakdown', 'balance', 'cumulative'

    const chartComponents = {
        breakdown: <LoanBreakdownChart principal={parseFloat(String(loanAmount).replace(/,/g, ''))} interest={results.totalInterest} isVisible={true} />,
        balance: <BalanceDeclineChart schedule={results.monthlySchedule} isVisible={true} formatCurrency={formatCurrency} maxChartValue={parseFloat(String(loanAmount).replace(/,/g, ''))} />,
        cumulative: <CumulativeChart schedule={results.monthlySchedule} isVisible={true} formatCurrency={formatCurrency} maxChartValue={parseFloat(String(loanAmount).replace(/,/g, ''))} />
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