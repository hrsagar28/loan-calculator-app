import React, { useState, useMemo } from 'react';
import usePersistentState from '../../hooks/usePersistentState';
import { formatInputValue, formatCurrency } from '../../utils/formatters';
import { icons } from '../../constants/icons';
import { SAFE_EMI_PERCENTAGE } from '../../constants/config';
import useFormInput from '../../hooks/useFormInput';

import InputWithValidation from '../common/InputWithValidation';
import ExpressiveSlider from '../common/ExpressiveSlider';

const AffordabilityCalculator = ({
    isOpen,
    onClose,
    setLoanAmount,
    setEmi,
    setCalculationMode,
    setTenureYears,
    showNotification,
    density,
    handleInteractiveClick
}) => {
    const [monthlyIncome, , handleIncomeChange] = useFormInput('');
    const [monthlyExpenses, , handleExpensesChange] = useFormInput('');
    const [affordabilityTenure, setAffordabilityTenure] = usePersistentState('affordabilityTenure', '15');
    const [interestRate, , handleInterestRateChange] = useFormInput('8.5', /^[0-9.]*$/);
    const [activeInput, setActiveInput] = useState(null);

    const affordabilityResult = useMemo(() => {
        const income = parseFloat(String(monthlyIncome).replace(/,/g, ''));
        const expenses = parseFloat(String(monthlyExpenses).replace(/,/g, ''));
        const N = parseInt(affordabilityTenure) * 12;
        const R_annual = parseFloat(interestRate);

        if (!monthlyIncome || !monthlyExpenses || !affordabilityTenure || !interestRate) {
            return null;
        }
        if (isNaN(R_annual) || R_annual < 0 || R_annual > 100) {
            return { error: "Rate must be between 0 and 100." };
        }
        if (isNaN(income) || isNaN(expenses) || isNaN(N) || income <= expenses) {
            return { error: "Enter valid income & expenses. Income must be greater than expenses." };
        }

        const R = R_annual / 12 / 100;
        const disposableIncome = income - expenses;
        const safeEmi = disposableIncome * SAFE_EMI_PERCENTAGE;

        let affordableLoanAmount = 0;
        if (R > 0) {
            affordableLoanAmount = (safeEmi * (Math.pow(1 + R, N) - 1)) / (R * Math.pow(1 + R, N));
        } else {
            affordableLoanAmount = safeEmi * N;
        }

        return {
            loanAmount: Math.round(affordableLoanAmount / 1000) * 1000,
            emi: Math.round(safeEmi)
        };
    }, [monthlyIncome, monthlyExpenses, affordabilityTenure, interestRate]);

    const useAffordableAmount = () => {
        if (affordabilityResult && affordabilityResult.loanAmount) {
            setLoanAmount(String(affordabilityResult.loanAmount));
            setEmi(String(affordabilityResult.emi));
            setTenureYears(affordabilityTenure);
            setCalculationMode('rate');
            showNotification('Affordable loan amount applied!');
            onClose();
        }
    };
    
    const handleFocus = (e) => setActiveInput(e.target.name);
    const handleBlur = (e) => setActiveInput(null);

    if (!isOpen) return null;

    const d = density;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="affordability-calculator-title">
            <div className="rounded-2xl shadow-glass w-full max-w-4xl bg-surface-container-high flex flex-col glass-effect border-glass" onClick={e => e.stopPropagation()}>
               <div className={`${d.p} grid md:grid-cols-2 gap-8 items-center`}>
                <div className="space-y-4">
                    <h2 id="affordability-calculator-title" className="text-[1.75em] font-semibold text-on-surface font-display text-center md:text-left">Affordability Calculator</h2>
                    <InputWithValidation id="monthlyIncome" name="monthlyIncome" label="Your Monthly Income" value={activeInput === 'monthlyIncome' ? monthlyIncome : formatInputValue(monthlyIncome)} onChange={handleIncomeChange} onFocus={handleFocus} onBlur={handleBlur} unit="₹" type="text" maxLength="10" inputMode="decimal" />
                    <InputWithValidation id="monthlyExpenses" name="monthlyExpenses" label="Your Monthly Expenses" value={activeInput === 'monthlyExpenses' ? monthlyExpenses : formatInputValue(monthlyExpenses)} onChange={handleExpensesChange} onFocus={handleFocus} onBlur={handleBlur} unit="₹" type="text" maxLength="10" inputMode="decimal" />
                    <div>
                        <ExpressiveSlider min={1} max={30} step={1} value={Number(affordabilityTenure)} onChange={(v) => setAffordabilityTenure(String(v))} icon="CalendarIcon" handleInteractiveClick={handleInteractiveClick} />
                    </div>
                    <InputWithValidation id="interestRate" name="interestRate" label="Assumed Interest Rate (%)" value={interestRate} onChange={handleInterestRateChange} onFocus={handleFocus} onBlur={handleBlur} icon="PercentIcon" type="text" maxLength="5" inputMode="decimal" />
                </div>

                <div className="min-h-[220px] flex flex-col items-center justify-center transition-all duration-300 ease-in-out p-4 rounded-2xl bg-surface-container">
                    {affordabilityResult ? (
                        <div className="text-center space-y-4 w-full animate-cascade-in">
                            {affordabilityResult.error ? (
                                <p className="text-error font-medium p-4">{affordabilityResult.error}</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-surface-container-low p-4 rounded-xl">
                                        <p className="text-sm text-on-surface-variant">You can likely afford a loan of about:</p>
                                        <p className="text-4xl font-bold text-primary font-display">{formatCurrency(affordabilityResult.loanAmount)}</p>
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-xl">
                                        <p className="text-sm text-on-surface-variant">with an estimated EMI of</p>
                                        <p className="text-2xl font-bold text-tertiary font-display">~{formatCurrency(affordabilityResult.emi)}</p>
                                    </div>
                                    <button onClick={handleInteractiveClick(useAffordableAmount)} className="w-full mt-4 py-3 font-bold rounded-full bg-primary text-on-primary shadow-lg hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2">
                                        <icons.TrendingUpIcon /> Use this Amount
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-on-surface-variant p-4">
                            <p>Enter your details to see what you can afford.</p>
                        </div>
                    )}
                    {affordabilityResult && !affordabilityResult.error && (
                        <p className="text-[0.8em] text-on-surface-variant text-center pt-4 max-w-xs mx-auto">*Note: Calculation assumes {SAFE_EMI_PERCENTAGE * 100}% of your disposable income can be safely allocated to your EMI.</p>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default AffordabilityCalculator;