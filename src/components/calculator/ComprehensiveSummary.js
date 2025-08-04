import React from 'react';
import { icons } from '../../constants/icons';

const ComprehensiveSummary = ({ results, formatCurrency, interestRate, calculationMode, loanAmount }) => {
    if (!results) return null;

    const principalAmount = parseFloat(String(loanAmount).replace(/,/g, ''));
    const hasSavings = results && (results.interestSaved > 0 || results.tenureReduced > 0);

    // Arranged items exactly as requested by the user for a balanced layout
    const summaryItems = [
        // Row 1
        { label: "Total Principal", value: formatCurrency(principalAmount), color: "text-primary" },
        { label: "Total Interest", value: formatCurrency(results.totalInterest), color: "text-tertiary" },
        { label: "Total Payment", value: formatCurrency(principalAmount + results.totalInterest) },
        
        // Row 2
        { label: "Final EMI", value: formatCurrency(results.calculatedEmi) },
        {
            label: calculationMode === 'rate' ? "Calculated Rate" : "Interest Rate",
            value: `${(calculationMode === 'rate' ? results.calculatedRate : parseFloat(interestRate)).toFixed(2)}%`,
            color: "text-primary"
        },
        
        // Row 3 is a bit different, we'll handle it separately in the grid
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
            {/* Using a more flexible grid layout */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                {/* Row 1 */}
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-2 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[0].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[0].value)} ${summaryItems[0].color || 'text-on-surface'}`}>{summaryItems[0].value}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-2 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[1].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[1].value)} ${summaryItems[1].color || 'text-on-surface'}`}>{summaryItems[1].value}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-2 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[2].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[2].value)} ${summaryItems[2].color || 'text-on-surface'}`}>{summaryItems[2].value}</p>
                </div>

                {/* Row 2 */}
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-3 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[4].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[4].value)} ${summaryItems[4].color || 'text-on-surface'}`}>{summaryItems[4].value}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-3 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[3].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[3].value)} ${summaryItems[3].color || 'text-on-surface'}`}>{summaryItems[3].value}</p>
                </div>

                {/* Row 3 */}
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-3 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[5].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[5].value)} ${summaryItems[5].color || 'text-on-surface'}`}>{summaryItems[5].value}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 transition-transform hover:scale-105 md:col-span-3 text-center">
                    <p className="text-[0.8em] text-on-surface-variant">{summaryItems[6].label}</p>
                    <p className={`font-bold font-display whitespace-nowrap ${getFontSizeForValue(summaryItems[6].value)} ${summaryItems[6].color || 'text-on-surface'}`}>{summaryItems[6].value}</p>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant">
                <h4 className="text-[1.25em] font-semibold text-on-surface font-display mb-3">Prepayment Savings</h4>
                {hasSavings ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-primary-container text-on-primary-container rounded-xl p-3 text-center transition-transform hover:scale-105 card-glow-effect">
                            <p className="font-semibold">Interest Saved</p>
                            <p className="font-bold text-2xl font-display">{formatCurrency(results.interestSaved)}</p>
                        </div>
                        <div className="bg-primary-container text-on-primary-container rounded-xl p-3 text-center transition-transform hover:scale-105 card-glow-effect">
                            <p className="font-semibold">Tenure Reduced By</p>
                            <p className="font-bold text-2xl font-display">{results.tenureReduced} months</p>
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