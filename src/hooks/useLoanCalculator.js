import { useState, useEffect, useCallback } from 'react';
import { MAX_LOAN_TENURE_MONTHS, MAX_CALCULATED_RATE } from '../constants/config';

const useLoanCalculator = (params) => {
    const {
        loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay,
        calculationMode, prepayments, formErrors, appMode, compoundingPeriod, variableRates
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

    const calculateSchedule = useCallback((principal, initialAnnualRate, emiAmount, initialTenureMonths, localPrepayments = [], localVariableRates = []) => {
        let balance = principal;
        const schedule = [];
        let totalInterestPaid = 0;
        
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

        while (balance > 0.01 && month < MAX_LOAN_TENURE_MONTHS) {
            // Update interest rate if a variable rate is scheduled for the current month
            if (variableRatesMap.has(month + 1)) {
                currentAnnualRate = variableRatesMap.get(month + 1);
            }
            
            const compoundingPeriods = getCompoundingPeriodsPerYear();
            const monthlyRate = Math.pow(1 + (currentAnnualRate / 100) / compoundingPeriods, compoundingPeriods / 12) - 1;
            
            const interestComponent = balance * monthlyRate;
            let principalComponent = emiAmount - interestComponent;
            let actualEmi = emiAmount;

            if (balance - principalComponent < 0) {
                principalComponent = balance;
                actualEmi = balance + interestComponent;
            }
            
            let prepaymentAmount = prepaymentsMap.get(month + 1) || 0;

            // Add recurring prepayments
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
                cumulativePrincipal: (principal - balance) + principalComponent,
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

            const P = parseFloat(String(loanAmount).replace(/,/g, ''));
            let E = parseFloat(String(emi).replace(/,/g, ''));
            let N = parseInt(tenureYears) * 12;
            let R_annual = parseFloat(interestRate);

            if (isNaN(P) || P <= 0) {
                setCalculationResults(null);
                throw new Error("Loan Amount must be a positive number.");
            }
            
            const compoundingPeriods = getCompoundingPeriodsPerYear();
            let R = Math.pow(1 + (R_annual / 100) / compoundingPeriods, compoundingPeriods / 12) - 1;

            if (calculationMode === 'rate') {
                if (E * N < P) { setCalculationResults(null); throw new Error("Total payments (EMI * Tenure) are less than the loan amount. Please increase the EMI or tenure."); }
                
                let low = 0, high = 1; // Corresponds to monthly rate
                for (let i = 0; i < 100; i++) {
                    let mid = (low + high) / 2;
                    if (mid === 0) break;
                    let calcEmi = P * mid * Math.pow(1 + mid, N) / (Math.pow(1 + mid, N) - 1);
                     if (isNaN(calcEmi) || !isFinite(calcEmi)) { high = mid; continue; }
                    if (calcEmi > E) high = mid; else low = mid;
                }
                R = (low + high) / 2;
                
                const effectiveAnnualRate = (Math.pow(1 + R, 12) - 1) * 100;
                R_annual = compoundingPeriods * (Math.pow(1 + effectiveAnnualRate / 100, 1 / compoundingPeriods) - 1) * 100;
                
                const monthlyInterest = P * R;
                if (monthlyInterest >= E) { setCalculationResults(null); throw new Error(`EMI of ${E.toLocaleString()} is too low to cover the monthly interest of ${monthlyInterest.toLocaleString()}.`); }

                if (R_annual > MAX_CALCULATED_RATE) {
                    setCalculationResults(null);
                    throw new Error(`Calculated rate of ${R_annual.toFixed(2)}% is unrealistically high. Please check your inputs.`);
                }

            } else if (calculationMode === 'emi') {
                if (R === 0) E = P / N;
                else E = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
            } else if (calculationMode === 'tenure') {
                const monthlyInterest = P * R;
                if (R > 0 && monthlyInterest >= E) { setCalculationResults(null); throw new Error(`EMI is too low. It must be greater than the monthly interest of ${monthlyInterest.toLocaleString()}.`); }
                if (R === 0) {
                    if (E > 0) N = P / E; else { setCalculationResults(null); throw new Error("EMI must be a positive number."); }
                } else {
                    N = Math.log(E / (E - P * R)) / Math.log(1 + R);
                }
                if (N > MAX_LOAN_TENURE_MONTHS) { setCalculationResults(null); throw new Error(`Calculated tenure exceeds the ${MAX_LOAN_TENURE_MONTHS / 12}-year limit. Please increase the EMI.`); }
            }
            
            if (isNaN(E) || isNaN(R_annual) || isNaN(N) || N < 0 || !isFinite(E) || !isFinite(R_annual) || !isFinite(N)) {
                setCalculationResults(null);
                throw new Error("Calculation resulted in invalid numbers. Please check your inputs.");
            }

            const originalTenureMonths = Math.min(Math.ceil(N), MAX_LOAN_TENURE_MONTHS);
            
            const { schedule: originalSchedule, totalInterestPaid: originalTotalInterest } = calculateSchedule(P, R_annual, E, originalTenureMonths, [], []);
            
            if (calculationMode !== 'tenure' && originalSchedule.length < (parseInt(tenureYears) * 12)) {
                const actualYears = Math.floor(originalSchedule.length / 12);
                const actualMonths = originalSchedule.length % 12;
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

            const { schedule: monthlySchedule, totalInterestPaid: totalInterestWithPrepayment } = calculateSchedule(P, R_annual, E, originalTenureMonths, prepayments, variableRates);
            
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
                totalPayment: P + totalInterestWithPrepayment,
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
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, calculateSchedule, getCompoundingPeriodsPerYear, variableRates]);

    useEffect(() => {
        if(appMode !== 'calculator') return;

        const isDesktop = window.innerWidth >= 1024;
        if(isDesktop) {
            performCalculation();
        }
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, appMode, performCalculation, compoundingPeriod, variableRates]);

    return { calculationResults, error, isLoading, performCalculation };
};

export default useLoanCalculator;