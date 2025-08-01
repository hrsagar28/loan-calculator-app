import React, { useState, useMemo } from 'react';
import usePersistentState from '../../hooks/usePersistentState';
import { formatInputValue, formatCurrency } from '../../utils/formatters';
import { icons } from '../../constants/icons';

// Child components from common folder
import InputWithValidation from '../common/InputWithValidation';
import ExpressiveSlider from '../common/ExpressiveSlider';

const AffordabilityCalculator = ({
    isOpen,
    onClose,
    setLoanAmount,
    setEmi,
    setCalculationMode,
    setTenureYears, // Accept the new prop
    showNotification,
    density,
    handleInteractiveClick
}) => {
    // State specific to this calculator mode
    const [monthlyIncome, setMonthlyIncome] = usePersistentState('monthlyIncome', '');
    const [monthlyExpenses, setMonthlyExpenses] = usePersistentState('monthlyExpenses', '');
    const [affordabilityTenure, setAffordabilityTenure] = usePersistentState('affordabilityTenure', '15'); // Renamed to avoid conflict
    const [interestRate, setInterestRate] = usePersistentState('affordabilityRate', '8.5');
    const [activeInput, setActiveInput] = useState(null);

    // Calculation logic encapsulated within the component
    const affordabilityResult = useMemo(() => {
        const income = parseFloat(String(monthlyIncome).replace(/,/g, ''));
        const expenses = parseFloat(String(monthlyExpenses).replace(/,/g, ''));
        const N = parseInt(affordabilityTenure) * 12; // Use local state for calculation
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
        const safeEmi = disposableIncome * 0.45; // Using 45% of disposable income for EMI

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

    // Handler to apply the calculated affordable amount to the main calculator
    const useAffordableAmount = () => {
        if (affordabilityResult && affordabilityResult.loanAmount) {
            setLoanAmount(String(affordabilityResult.loanAmount));
            setEmi(String(affordabilityResult.emi));
            setTenureYears(affordabilityTenure); // Update the main tenure state
            setCalculationMode('rate'); // Switch main calculator to 'rate' mode
            showNotification('Affordable loan amount applied!');
            onClose();
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/,/g, '');

        if (!/^\d*\.?\d*$/.test(rawValue)) return;

        switch (name) {
            case 'monthlyIncome':
                setMonthlyIncome(rawValue);
                break;
            case 'monthlyExpenses':
                setMonthlyExpenses(rawValue);
                break;
            case 'interestRate':
                setInterestRate(value); 
                break;
            default:
                break;
        }
    };
    
    const handleFocus = (e) => setActiveInput(e.target.name);
    const handleBlur = (e) => setActiveInput(null);

    if (!isOpen) return null;

    const d = density;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="rounded-2xl shadow-glass w-full max-w-4xl bg-surface-container-high flex flex-col glass-effect border-glass" onClick={e => e.stopPropagation()}>
               <div className={`${d.p} grid md:grid-cols-2 gap-8 items-center`}>
                <div className="space-y-4">
                    <h2 className="text-[1.75em] font-semibold text-on-surface font-display text-center md:text-left">Affordability Calculator</h2>
                    <InputWithValidation id="monthlyIncome" name="monthlyIncome" label="Your Monthly Income" value={activeInput === 'monthlyIncome' ? monthlyIncome : formatInputValue(monthlyIncome)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} unit="₹" type="text" maxLength="10" inputMode="decimal" />
                    <InputWithValidation id="monthlyExpenses" name="monthlyExpenses" label="Your Monthly Expenses" value={activeInput === 'monthlyExpenses' ? monthlyExpenses : formatInputValue(monthlyExpenses)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} unit="₹" type="text" maxLength="10" inputMode="decimal" />
                    <div>
                        <ExpressiveSlider min={1} max={30} step={1} value={Number(affordabilityTenure)} onChange={(v) => setAffordabilityTenure(String(v))} icon="Calendar" handleInteractiveClick={handleInteractiveClick} />
                    </div>
                    <InputWithValidation id="interestRate" name="interestRate" label="Assumed Interest Rate (%)" value={interestRate} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} icon="Percent" type="text" maxLength="5" inputMode="decimal" />
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
                                        <icons.TrendingUp /> Use this Amount
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
                        <p className="text-[0.8em] text-on-surface-variant text-center pt-4 max-w-xs mx-auto">*Note: Calculation assumes 45% of your disposable income can be safely allocated to your EMI.</p>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default AffordabilityCalculator;