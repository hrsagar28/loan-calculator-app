import { useState, useEffect, useCallback } from 'react';

const useLoanCalculator = (params) => {
    const {
        loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay,
        calculationMode, prepayments, formErrors, appMode
    } = params;

    const [calculationResults, setCalculationResults] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const performCalculation = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setCalculationResults(null);

        try {
            // --- Input Validation ---
            if (
                (calculationMode === 'rate' && (!loanAmount || !tenureYears || !emi)) ||
                (calculationMode === 'emi' && (!loanAmount || !tenureYears || !interestRate)) ||
                (calculationMode === 'tenure' && (!loanAmount || !emi || !interestRate))
            ) {
                throw new Error("Please fill all required fields to calculate.");
            }
             if (Object.values(formErrors).some(e => e)) {
                throw new Error("Please fix the validation errors before calculating.");
            }


            const P = parseFloat(String(loanAmount).replace(/,/g, ''));
            let E = parseFloat(String(emi).replace(/,/g, ''));
            let N = parseInt(tenureYears) * 12;
            let R = parseFloat(interestRate) / 12 / 100;

            if (isNaN(P) || P <= 0) throw new Error("Invalid Loan Amount.");

            // --- Calculation Logic ---
             if (calculationMode === 'rate') {
                if (E * N < P) throw new Error("EMI is too low to cover the principal.");
                let low = 0, high = 1;
                for (let i = 0; i < 100; i++) {
                    let mid = (low + high) / 2;
                    if (mid === 0) break;
                    let calcEmi = P * mid * Math.pow(1 + mid, N) / (Math.pow(1 + mid, N) - 1);
                     if (isNaN(calcEmi) || !isFinite(calcEmi)) { high = mid; continue; }
                    if (calcEmi > E) high = mid; else low = mid;
                }
                R = (low + high) / 2;
                if (P * R >= E) throw new Error("EMI is too low to cover monthly interest.");
            } else if (calculationMode === 'emi') {
                if (R === 0) E = P / N;
                else E = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
            } else if (calculationMode === 'tenure') {
                if (R > 0 && P * R >= E) throw new Error("EMI is too low to cover the interest.");
                if (R === 0) {
                    if (E > 0) N = P / E; else throw new Error("EMI must be positive.");
                } else {
                    N = Math.log(E / (E - P * R)) / Math.log(1 + R);
                }
                if (N > 360) throw new Error("Calculated tenure exceeds the 30-year limit.");
            }
            
            if (isNaN(E) || isNaN(R) || isNaN(N) || N < 0 || !isFinite(E) || !isFinite(R) || !isFinite(N)) {
                throw new Error("Calculation resulted in invalid numbers.");
            }

            // --- Schedule Generation ---
            let balance = P;
            const monthlySchedule = [];
            let totalInterest = 0;
            const prepaymentsMap = new Map(prepayments.map(p => [parseInt(p.month), parseFloat(String(p.amount || 0).replace(/,/g, ''))]));
            let m = 0;
            const maxMonths = Math.min(Math.ceil(N), 360);

            while (balance > 0.01 && m < maxMonths) {
                const paymentDate = new Date(startDate);
                paymentDate.setMonth(paymentDate.getMonth() + m, 1);
                const daysInMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
                paymentDate.setDate(Math.min(parseInt(emiPaymentDay), daysInMonth));

                const interestComponent = balance * R;
                let principalComponent = E - interestComponent;
                let actualEmi = E;

                if (balance - principalComponent < 0) {
                    principalComponent = balance;
                    actualEmi = balance + interestComponent;
                }

                const prepaymentAmount = prepaymentsMap.get(m + 1) || 0;
                if (prepaymentAmount > 0 && prepaymentAmount > balance - principalComponent) {
                    throw new Error(`Prepayment in month ${m + 1} exceeds remaining balance.`);
                }
                
                const endingBalance = balance - principalComponent - prepaymentAmount;
                monthlySchedule.push({ month: m + 1, date: paymentDate, beginningBalance: balance, emi: actualEmi, principal: principalComponent, interest: interestComponent, prepayment: prepaymentAmount, endingBalance: endingBalance < 0 ? 0 : endingBalance });
                totalInterest += interestComponent;
                balance = endingBalance;
                m++;
            }
            
            if (balance > 0.01) {
                throw new Error("Loan cannot be paid off with the given inputs within the tenure.");
            }

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
                calculatedRate: R * 12 * 100,
                calculatedEmi: E,
                totalInterest,
                totalPayment: P,
                monthlySchedule,
                financialYearBreakdown: Array.from(fyMap.entries()).map(([year, data]) => ({ year, ...data })),
                loanEndDate: monthlySchedule.length > 0 ? monthlySchedule[monthlySchedule.length - 1].date : new Date()
            };

            setCalculationResults(finalResults);

        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors]);

    useEffect(() => {
        if(appMode !== 'calculator') return;

        // Auto-calculate on desktop
        const isDesktop = window.innerWidth >= 1024;
        if(isDesktop) {
            performCalculation();
        }
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, appMode, performCalculation]);

    return { calculationResults, error, isLoading, performCalculation };
};

export default useLoanCalculator;