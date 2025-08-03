import React from 'react';
import Card from '../common/Card';
import ComprehensiveSummary from '../calculator/ComprehensiveSummary';
import UnifiedChartView from '../charts/UnifiedChartView';
import { icons } from '../../constants/icons';

const DashboardView = ({ results, isLoading, hasError, errorMessage, onShowSchedule, formatCurrency, loanAmount, interestRate, calculationMode, density }) => {
    const d = density;
    const hasValidResults = results && !hasError;

    if (isLoading) {
        return <div className="animate-pulse h-full rounded-2xl bg-surface-container-highest"></div>;
    }

    if (hasError) {
        return (
            <Card className={`${d.p} h-full flex flex-col items-center justify-center text-center`}>
                <div className="p-4 rounded-2xl bg-error-container text-on-error-container">
                    <p className="font-bold text-lg">Calculation Error</p>
                    <p>{errorMessage}</p>
                </div>
            </Card>
        );
    }

    if (!hasValidResults) {
         return (
            <Card className={`${d.p} h-full flex flex-col items-center justify-center text-center`}>
                <icons.LoanLogoIcon className="w-24 h-24 text-primary opacity-20 mb-4"/>
                <h2 className="text-2xl font-display font-bold text-on-surface-variant">Your Loan Dashboard</h2>
                <p className="text-on-surface-variant max-w-sm">Enter your loan details in the panel on the left to see your results and visualizations here.</p>
            </Card>
        );
    }


    return (
        <div className="space-y-6">
            <Card className={`${d.p}`}>
                 <ComprehensiveSummary 
                    results={results} 
                    formatCurrency={formatCurrency} 
                    interestRate={interestRate} 
                    calculationMode={calculationMode} 
                 />
            </Card>
            <Card className={`${d.p}`}>
                <UnifiedChartView
                    results={results}
                    formatCurrency={formatCurrency}
                    loanAmount={loanAmount}
                />
            </Card>
            <Card className={`${d.p} text-center`}>
                <button onClick={onShowSchedule} className="w-full font-bold py-3 rounded-full bg-primary text-on-primary shadow-lg hover:opacity-90 transition-opacity active:scale-95">
                    View Full Repayment Schedule
                </button>
            </Card>
        </div>
    );
};

export default DashboardView;