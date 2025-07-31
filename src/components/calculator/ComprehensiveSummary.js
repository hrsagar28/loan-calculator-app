import React from 'react';
import { icons } from '../../constants/icons';
import { PrepaymentSavings } from './PrepaymentSimulator';

const ComprehensiveSummary = ({ results, formatCurrency, interestRate, calculationMode }) => {
    if (!results) return null;

    const summaryItems = [
        { label: "Total Principal", value: formatCurrency(results.totalPayment), color: "text-primary" },
        { label: "Total Interest", value: formatCurrency(results.totalInterest), color: "text-tertiary" },
        { label: "Final Tenure", value: `${Math.floor(results.monthlySchedule.length / 12)}y ${results.monthlySchedule.length % 12}m` },
        {
            label: calculationMode === 'rate' ? "Calculated Rate" : "Interest Rate",
            value: `${(calculationMode === 'rate' ? results.calculatedRate : parseFloat(interestRate)).toFixed(2)}%`,
            color: "text-primary"
        },
        { label: "Final EMI", value: formatCurrency(results.calculatedEmi) },
        { label: "Loan Ends On", value: results.loanEndDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
    ];

    const getFontSizeForValue = (value) => {
        const len = String(value).length;
        if (len > 12) {
            return 'text-[1em] md:text-[1.25em]';
        }
        if (len > 9) {
            return 'text-[1.125em] md:text-[1.5em]';
        }
        return 'text-[1.25em] md:text-[1.5em]';
    };


    return (
        <div>
            <h3 className="text-[1.5em] font-semibold text-on-surface font-display mb-4 flex items-center gap-2">
                <icons.TrendingUp className="text-primary"/> Loan Summary & Insights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {summaryItems.map(item => (
                    <div key={item.label} className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105">
                        <p className="text-[0.8em] text-on-surface-variant">{item.label}</p>
                        <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(item.value)} ${item.color || 'text-on-surface'}`}>{item.value}</p>
                    </div>
                ))}
            </div>
            <PrepaymentSavings results={results} formatCurrency={formatCurrency} />
        </div>
    );
};

export default ComprehensiveSummary;