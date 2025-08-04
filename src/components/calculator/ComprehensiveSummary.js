import React from 'react';
import { icons } from '../../constants/icons';

const ComprehensiveSummary = ({ results, formatCurrency, interestRate, calculationMode, loanAmount }) => {
    if (!results) return null;

    const principalAmount = parseFloat(String(loanAmount).replace(/,/g, ''));
    const hasSavings = results && (results.interestSaved > 0 || results.tenureReduced > 0);
    
    // Calculate the total of all prepayments made
    const totalPrepaymentAmount = results.monthlySchedule.reduce((acc, month) => acc + month.prepayment, 0);

    const summaryItems = [
        { label: "Total Principal", value: formatCurrency(principalAmount), color: "text-primary" },
        { label: "Total Interest", value: formatCurrency(results.totalInterest), color: "text-tertiary" },
        { label: "Final EMI", value: formatCurrency(results.calculatedEmi) },
        {
            label: calculationMode === 'rate' ? "Calculated Rate" : "Interest Rate",
            value: `${(calculationMode === 'rate' ? results.calculatedRate : parseFloat(interestRate)).toFixed(2)}%`,
            color: "text-primary"
        },
        { label: "Final Tenure", value: `${Math.floor(results.monthlySchedule.length / 12)}y ${results.monthlySchedule.length % 12}m` },
        { label: "Loan Ends On", value: results.loanEndDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
    ];

    const getFontSizeForValue = (value) => {
        const len = String(value).length;
        if (len > 12) return 'text-[1em] md:text-[1.25em]';
        if (len > 9) return 'text-[1.125em] md:text-[1.5em]';
        return 'text-[1.25em] md:text-[1.5em]';
    };

    return (
        <div>
            <h3 className="text-[1.5em] font-semibold text-on-surface font-display mb-4 flex items-center gap-2">
                <icons.TrendingUpIcon className="text-primary"/> Loan Summary & Insights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {summaryItems.map(item => (
                    <div key={item.label} className="bg-surface-container rounded-xl p-3 text-center transition-transform hover:scale-105">
                        <p className="text-[0.8em] text-on-surface-variant">{item.label}</p>
                        <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(item.value)} ${item.color || 'text-on-surface'}`}>{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant">
                <h4 className="text-[1.25em] font-semibold text-on-surface font-display mb-3">Prepayment Savings</h4>
                {hasSavings ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-3 text-center transition-transform hover:scale-105 card-glow-effect">
                            <p className="font-semibold">Interest Saved</p>
                            <p className="font-bold text-2xl font-display">{formatCurrency(results.interestSaved)}</p>
                        </div>
                        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-3 text-center transition-transform hover:scale-105 card-glow-effect">
                            <p className="font-semibold">Tenure Reduced By</p>
                            <p className="font-bold text-2xl font-display">{results.tenureReduced} months</p>
                        </div>
                        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-3 text-center transition-transform hover:scale-105 card-glow-effect">
                            <p className="font-semibold">Total Prepayments</p>
                            <p className="font-bold text-2xl font-display">{formatCurrency(totalPrepaymentAmount)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-surface-container rounded-xl text-on-surface-variant">
                        <p>Add prepayments using the simulator to see your potential savings here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComprehensiveSummary;