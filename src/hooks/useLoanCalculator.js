import { useState, useEffect, useCallback } from 'react';
import { MAX_LOAN_TENURE_MONTHS, MAX_CALCULATED_RATE } from '../constants/config';

const useLoanCalculator = (params) => {
    const {
        loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay,
        calculationMode, prepayments, formErrors, appMode, compoundingPeriod, variableRates, moratoriumMonths
    } = params;

    const [calculationResults, setCalculationResults] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getCompoundingPeriodsPerYear = useCallback(() => {
        switch (compoundingPeriod) {
            case 'daily': return 365;
            case 'fortnightly': return 26;
            case 'monthly': return 12;
            case 'quarterly': return 4;
            case 'semi-annually': return 2;
            case 'annually': return 1;
            default: return 12;
        }
    }, [compoundingPeriod]);

    const calculateSchedule = useCallback((principal, initialAnnualRate, emiAmount, initialTenureMonths, localPrepayments = [], localVariableRates = [], morMonths = 0) => {
        let balance = principal;
        const schedule = [];
        let totalInterestPaid = 0;
        let cumulativePrincipalPaid = 0;
        const moratoriumPeriod = parseInt(morMonths, 10) || 0;

        const prepaymentsMap = new Map();
        const recurringPrepayments = [];

        localPrepayments.forEach(p => {
            const month = parseInt(p.month);
            const amount = parseFloat(String(p.amount || 0).replace(/,/g, ''));
            if (p.frequency === 'one-time') {
                prepaymentsMap.set(month, (prepaymentsMap.get(month) || 0) + amount);
            } else {
                recurringPrepayments.push({ ...p, startMonth: month, amount });
            }
        });
        
        const variableRatesMap = new Map(localVariableRates.map(r => [parseInt(r.month), parseFloat(r.rate)]));
        
        let month = 0;
        let currentAnnualRate = initialAnnualRate;
        const compoundingPeriods = getCompoundingPeriodsPerYear();

        // Moratorium Period Calculation
        for (let i = 0; i < moratoriumPeriod; i++) {
            if (variableRatesMap.has(month + 1)) {
                currentAnnualRate = variableRatesMap.get(month + 1);
            }
            const monthlyRate = Math.pow(1 + (currentAnnualRate / 100) / compoundingPeriods, compoundingPeriods / 12) - 1;
            const interestComponent = balance * monthlyRate;
            
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + month, 1);
            const daysInMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
            paymentDate.setDate(Math.min(parseInt(emiPaymentDay), daysInMonth));

            schedule.push({
                month: month + 1,
                date: paymentDate,
                beginningBalance: balance,
                emi: 0,
                principal: 0,
                interest: interestComponent,
                prepayment: 0,
                endingBalance: balance + interestComponent,
                cumulativeInterest: totalInterestPaid + interestComponent,
                cumulativePrincipal: 0,
                effectiveRate: currentAnnualRate,
            });

            totalInterestPaid += interestComponent;
            balance += interestComponent; // Capitalize interest
            month++;
        }

        // Regular Repayment Period Calculation
        while (balance > 0.01 && month < MAX_LOAN_TENURE_MONTHS) {
            if (variableRatesMap.has(month + 1)) {
                currentAnnualRate = variableRatesMap.get(month + 1);
            }
            
            const monthlyRate = Math.pow(1 + (currentAnnualRate / 100) / compoundingPeriods, compoundingPeriods / 12) - 1;
            
            const interestComponent = balance * monthlyRate;
            let principalComponent = emiAmount - interestComponent;
            let actualEmi = emiAmount;

            if (balance - principalComponent < 0) {
                principalComponent = balance;
                actualEmi = balance + interestComponent;
            }
            
            let prepaymentAmount = prepaymentsMap.get(month + 1) || 0;

            recurringPrepayments.forEach(rp => {
                if ((month + 1) >= rp.startMonth) {
                    const monthDiff = (month + 1) - rp.startMonth;
                    if (rp.frequency === 'monthly' && monthDiff >= 0) {
                        prepaymentAmount += rp.amount;
                    } else if (rp.frequency === 'quarterly' && monthDiff >= 0 && monthDiff % 3 === 0) {
                        prepaymentAmount += rp.amount;
                    } else if (rp.frequency === 'annually' && monthDiff >= 0 && monthDiff % 12 === 0) {
                        prepaymentAmount += rp.amount;
                    }
                }
            });

            if (prepaymentAmount > 0 && prepaymentAmount > balance - principalComponent) {
                 throw new Error(`Prepayment in month ${month + 1} (${prepaymentAmount.toLocaleString()}) exceeds the remaining balance.`);
            }

            const endingBalance = balance - principalComponent - prepaymentAmount;
            
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + month, 1);
            const daysInMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
            paymentDate.setDate(Math.min(parseInt(emiPaymentDay), daysInMonth));

            cumulativePrincipalPaid += principalComponent;

            schedule.push({
                month: month + 1,
                date: paymentDate,
                beginningBalance: balance,
                emi: actualEmi,
                principal: principalComponent,
                interest: interestComponent,
                prepayment: prepaymentAmount,
                endingBalance: endingBalance < 0 ? 0 : endingBalance,
                cumulativeInterest: totalInterestPaid + interestComponent,
                cumulativePrincipal: cumulativePrincipalPaid,
                effectiveRate: currentAnnualRate,
            });

            totalInterestPaid += interestComponent;
            balance = endingBalance;
            month++;
        }
        
        if (balance > 0.01 && month >= MAX_LOAN_TENURE_MONTHS) {
            throw new Error(`The loan cannot be paid off within the ${MAX_LOAN_TENURE_MONTHS / 12}-year limit with the given inputs.`);
        }

        return { schedule, totalInterestPaid };
    }, [startDate, emiPaymentDay, getCompoundingPeriodsPerYear]);

    const performCalculation = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        try {
            if (
                (calculationMode === 'rate' && (!loanAmount || !tenureYears || !emi)) ||
                (calculationMode === 'emi' && (!loanAmount || !tenureYears || !interestRate)) ||
                (calculationMode === 'tenure' && (!loanAmount || !emi || !interestRate))
            ) {
                setCalculationResults(null);
                throw new Error("Please fill all required fields to perform the calculation.");
            }
             if (Object.values(formErrors).some(e => e)) {
                setCalculationResults(null);
                throw new Error("Please fix the validation errors before calculating.");
            }

            const P_initial = parseFloat(String(loanAmount).replace(/,/g, ''));
            const morMonths = parseInt(moratoriumMonths, 10) || 0;
            let E = parseFloat(String(emi).replace(/,/g, ''));
            let N_total = parseInt(tenureYears) * 12;
            let R_annual = parseFloat(interestRate);

            if (isNaN(P_initial) || P_initial <= 0) {
                setCalculationResults(null);
                throw new Error("Loan Amount must be a positive number.");
            }
            
            const compoundingPeriods = getCompoundingPeriodsPerYear();
            let R = Math.pow(1 + (R_annual / 100) / compoundingPeriods, compoundingPeriods / 12) - 1;

            let P_after_moratorium = P_initial;
            if (R > 0 && morMonths > 0) {
                P_after_moratorium = P_initial * Math.pow(1 + R, morMonths);
            }

            let N_repayment = N_total - morMonths;

            if (N_repayment <= 0 && (calculationMode === 'emi' || calculationMode === 'rate')) {
                throw new Error("Tenure must be longer than the moratorium period.");
            }

            if (calculationMode === 'rate') {
                if (E * N_repayment < P_after_moratorium) { setCalculationResults(null); throw new Error("Total payments are less than the loan amount after moratorium."); }
                
                let low = 0, high = 1; // Corresponds to monthly rate
                for (let i = 0; i < 100; i++) {
                    let mid = (low + high) / 2;
                    if (mid === 0) break;
                    let calcEmi = P_after_moratorium * mid * Math.pow(1 + mid, N_repayment) / (Math.pow(1 + mid, N_repayment) - 1);
                     if (isNaN(calcEmi) || !isFinite(calcEmi)) { high = mid; continue; }
                    if (calcEmi > E) high = mid; else low = mid;
                }
                R = (low + high) / 2;
                
                const effectiveAnnualRate = (Math.pow(1 + R, 12) - 1) * 100;
                R_annual = compoundingPeriods * (Math.pow(1 + effectiveAnnualRate / 100, 1 / compoundingPeriods) - 1) * 100;
                
                const monthlyInterest = P_after_moratorium * R;
                if (monthlyInterest >= E) { setCalculationResults(null); throw new Error(`EMI of ${E.toLocaleString()} is too low to cover the monthly interest of ${monthlyInterest.toLocaleString()}.`); }

                if (R_annual > MAX_CALCULATED_RATE) {
                    setCalculationResults(null);
                    throw new Error(`Calculated rate of ${R_annual.toFixed(2)}% is unrealistically high. Please check your inputs.`);
                }

            } else if (calculationMode === 'emi') {
                if (R === 0) E = P_after_moratorium / N_repayment;
                else E = P_after_moratorium * R * Math.pow(1 + R, N_repayment) / (Math.pow(1 + R, N_repayment) - 1);
            } else if (calculationMode === 'tenure') {
                const monthlyInterest = P_after_moratorium * R;
                if (R > 0 && monthlyInterest >= E) { setCalculationResults(null); throw new Error(`EMI is too low. It must be greater than the monthly interest of ${monthlyInterest.toLocaleString()}.`); }
                if (R === 0) {
                    if (E > 0) N_repayment = P_after_moratorium / E; else { setCalculationResults(null); throw new Error("EMI must be a positive number."); }
                } else {
                    N_repayment = Math.log(E / (E - P_after_moratorium * R)) / Math.log(1 + R);
                }
                N_total = morMonths + N_repayment;
                if (N_total > MAX_LOAN_TENURE_MONTHS) { setCalculationResults(null); throw new Error(`Calculated tenure exceeds the ${MAX_LOAN_TENURE_MONTHS / 12}-year limit. Please increase the EMI.`); }
            }
            
            if (isNaN(E) || isNaN(R_annual) || isNaN(N_total) || N_total < 0 || !isFinite(E) || !isFinite(R_annual) || !isFinite(N_total)) {
                setCalculationResults(null);
                throw new Error("Calculation resulted in invalid numbers. Please check your inputs.");
            }

            const originalTenureMonths = Math.min(Math.ceil(N_total), MAX_LOAN_TENURE_MONTHS);
            
            const { schedule: originalSchedule, totalInterestPaid: originalTotalInterest } = calculateSchedule(P_initial, R_annual, E, originalTenureMonths, [], [], morMonths);
            
            if (calculationMode !== 'tenure' && originalSchedule.length < (parseInt(tenureYears) * 12)) {
                 const actualTotalMonths = originalSchedule.length;
                 const actualYears = Math.floor(actualTotalMonths / 12);
                 const actualMonths = actualTotalMonths % 12;
                 let tenureMessage = '';
                 if (actualYears > 0) {
                     tenureMessage += `${actualYears} year${actualYears > 1 ? 's' : ''}`;
                 }
                 if (actualMonths > 0) {
                     if (tenureMessage) tenureMessage += ' and ';
                     tenureMessage += `${actualMonths} month${actualMonths > 1 ? 's' : ''}`;
                 }
                 throw new Error(`The provided EMI is too high for the selected tenure. The loan will be paid off in ${tenureMessage}. Please select a shorter tenure or a lower EMI.`);
            }

            const { schedule: monthlySchedule, totalInterestPaid: totalInterestWithPrepayment } = calculateSchedule(P_initial, R_annual, E, originalTenureMonths, prepayments, variableRates, morMonths);
            
            const interestSaved = originalTotalInterest - totalInterestWithPrepayment;
            const tenureReduced = originalSchedule.length - monthlySchedule.length;

            const getFinancialYear = (date) => {
                const year = date.getFullYear();
                const month = date.getMonth();
                return month >= 3 ? `FY ${year}-${String(year + 1).slice(2)}` : `FY ${year - 1}-${String(year).slice(2)}`;
            };
            
            const fyMap = new Map();
            monthlySchedule.forEach(item => {
                const fy = getFinancialYear(item.date);
                if (!fyMap.has(fy)) fyMap.set(fy, { principal: 0, interest: 0, totalPrepayment: 0, closingBalance: 0, months: [] });
                const currentFy = fyMap.get(fy);
                currentFy.principal += item.principal;
                currentFy.interest += item.interest;
                currentFy.totalPrepayment += item.prepayment;
                currentFy.closingBalance = item.endingBalance;
                currentFy.months.push(item);
            });

            const finalResults = {
                calculatedRate: R_annual,
                calculatedEmi: E,
                totalInterest: totalInterestWithPrepayment,
                totalPayment: P_initial + totalInterestWithPrepayment,
                monthlySchedule,
                financialYearBreakdown: Array.from(fyMap.entries()).map(([year, data]) => ({ year, ...data })),
                loanEndDate: monthlySchedule.length > 0 ? monthlySchedule[monthlySchedule.length - 1].date : new Date(),
                interestSaved,
                tenureReduced
            };

            setCalculationResults(finalResults);

        } catch (e) {
            setCalculationResults(null);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, calculateSchedule, getCompoundingPeriodsPerYear, variableRates, moratoriumMonths]);

    useEffect(() => {
        if(appMode !== 'calculator') return;

        const isDesktop = window.innerWidth >= 1024;
        if(isDesktop) {
            performCalculation();
        }
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, appMode, performCalculation, compoundingPeriod, variableRates, moratoriumMonths]);

    return { calculationResults, error, isLoading, performCalculation };
};

export default useLoanCalculator;
