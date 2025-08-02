import { useMemo, useCallback } from 'react';

// This custom hook encapsulates all the loan calculation logic.
const useLoanCalculator = ({
    loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay,
    calculationMode, prepayments, formErrors, appMode
}) => {

    const calculateSchedule = useCallback((params) => {
        const {
            loanAmount: P_str, tenureYears: N_str, emi: E_str, interestRate: R_str,
            prepayments: currentPrepayments = [], startDate: currentStartDate,
            emiPaymentDay: currentEmiDay, calculationMode: mode
        } = params;

        const P = parseFloat(String(P_str).replace(/,/g, ''));
        let E = parseFloat(String(E_str).replace(/,/g, ''));
        let N = parseInt(N_str) * 12;
        let R = parseFloat(R_str) / 12 / 100;

        if (isNaN(P) || P <= 0) return { error: "Invalid Loan Amount." };

        try {
            if (mode === 'rate') {
                if (isNaN(E) || isNaN(N) || N <= 0 || E <= 0) throw new Error("Enter valid EMI & Tenure for rate calculation.");
                let low = 0, high = 1; // Rate is between 0% and 1200% annually (100% monthly)
                for (let i = 0; i < 100; i++) { // 100 iterations for precision
                    let mid = (low + high) / 2;
                    if (mid === 0) break;
                    let calcEmi = P * mid * Math.pow(1 + mid, N) / (Math.pow(1 + mid, N) - 1);
                    if (isNaN(calcEmi)) { throw new Error("Could not calculate rate. Inputs may be invalid."); }
                    if (calcEmi > E) high = mid;
                    else low = mid;
                }
                R = (low + high) / 2;
            } else if (mode === 'emi') {
                if (isNaN(R) || isNaN(N) || N <= 0 || R < 0) throw new Error("Enter valid Rate & Tenure for EMI calculation.");
                if (R === 0) { E = P / N; }
                else { E = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1); }
            } else if (mode === 'tenure') {
                if (isNaN(E) || isNaN(R) || E <= 0 || R < 0) throw new Error("Enter valid Rate & EMI for tenure calculation.");
                if (R > 0 && (P * R) >= E) {
                    throw new Error("EMI is too low to cover the interest. The loan will never be repaid.");
                }
                if (R === 0) {
                    if (E > 0) { N = P / E; }
                    else { throw new Error("EMI must be positive."); }
                } else {
                    if (P * R >= E) throw new Error("EMI must be greater than monthly interest.");
                    N = Math.log(E / (E - P * R)) / Math.log(1 + R);
                }
                if (N > 360) { // 30 years * 12 months
                    throw new Error("The calculated tenure exceeds the 30-year limit.");
                }
            }
        } catch (e) {
            return { error: e.message };
        }

        if (isNaN(E) || isNaN(R) || isNaN(N) || N < 0) return { error: "Calculation resulted in invalid numbers." };

        let balance = P;
        const monthlySchedule = [];
        let totalInterest = 0, totalPrincipal = 0;
        let cumulativeInterest = 0, cumulativePrincipal = 0;
        const start = new Date(currentStartDate);
        if (start.getDate() > parseInt(currentEmiDay)) {
            start.setMonth(start.getMonth() + 1);
        }

        const prepaymentsMap = new Map(currentPrepayments.map(p => [parseInt(p.month), parseFloat(String(p.amount || 0).replace(/,/g, ''))]));
        let m = 0;
        const maxMonths = Math.max(Math.ceil(N), 1200); // Max 100 years to prevent infinite loops

        while (balance > 0.01 && m < maxMonths) {
            const paymentDate = new Date(start);
            paymentDate.setMonth(start.getMonth() + m, 1);
            const daysInMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
            const actualPaymentDay = Math.min(parseInt(currentEmiDay), daysInMonth);
            paymentDate.setDate(actualPaymentDay);

            const interestComponent = balance * R;
            let principalComponent = E - interestComponent;
            let actualEmi = E;

            if (balance - principalComponent < 0) {
                principalComponent = balance;
                actualEmi = balance + interestComponent;
            }

            let prepaymentAmount = prepaymentsMap.get(m + 1) || 0;
            const balanceAfterEmi = balance - principalComponent;

            if (prepaymentAmount > 0 && prepaymentAmount > balanceAfterEmi) {
                 return { error: `Prepayment in month ${m + 1} exceeds remaining balance.` };
            }

            const endingBalance = balance - principalComponent - prepaymentAmount;

            cumulativeInterest += interestComponent;
            cumulativePrincipal += principalComponent + prepaymentAmount;

            monthlySchedule.push({
                month: m + 1, date: paymentDate, beginningBalance: balance, emi: actualEmi,
                principal: principalComponent, interest: interestComponent, prepayment: prepaymentAmount,
                endingBalance: endingBalance < 0 ? 0 : endingBalance, cumulativeInterest, cumulativePrincipal
            });

            totalInterest += interestComponent;
            totalPrincipal += principalComponent + prepaymentAmount;
            balance = endingBalance;
            m++;
        }

        const getFinancialYear = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-indexed (0 for January)
            return month >= 3 ? `FY ${year}-${String(year + 1).slice(2)}` : `FY ${year - 1}-${String(year).slice(2)}`;
        };

        const fyMap = new Map();
        monthlySchedule.forEach(item => {
            const fy = getFinancialYear(item.date);
            if (!fyMap.has(fy)) {
                fyMap.set(fy, { principal: 0, interest: 0, totalPrepayment: 0, closingBalance: 0, months: [] });
            }
            const currentFy = fyMap.get(fy);
            currentFy.principal += item.principal;
            currentFy.interest += item.interest;
            currentFy.totalPrepayment += item.prepayment;
            currentFy.closingBalance = item.endingBalance;
            currentFy.months.push(item);
        });

        const financialYearBreakdown = Array.from(fyMap.entries()).map(([year, data]) => ({ year, ...data }));

        return {
            data: {
                calculatedRate: R * 12 * 100,
                calculatedEmi: E,
                calculatedTenure: N,
                totalInterest,
                totalPayment: totalPrincipal,
                monthlySchedule,
                financialYearBreakdown,
                loanEndDate: monthlySchedule.length > 0 ? monthlySchedule[monthlySchedule.length - 1].date : new Date()
            }
        };
    }, []);

    const processedResult = useMemo(() => {
        if (appMode !== 'calculator') return null;

        // Basic validation to prevent calculation with empty required fields
        if (calculationMode === 'rate' && (!loanAmount || !tenureYears || !emi)) return null;
        if (calculationMode === 'emi' && (!loanAmount || !tenureYears || !interestRate)) return null;
        if (calculationMode === 'tenure' && (!loanAmount || !emi || !interestRate)) return null;

        if (Object.values(formErrors).some(e => e)) {
            return { error: "Please fix the errors before calculating." };
        }

        const P = parseFloat(String(loanAmount).replace(/,/g, ''));
        if (isNaN(P) || P <= 0) return { error: "Please enter a valid Loan Amount." };
        if (P > 1000000000) return { error: "Loan Amount seems too high." };

        // Perform calculation for base scenario (without prepayments) to find savings
        const baseParams = { loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments: [] };
        const preliminaryResult = calculateSchedule(baseParams);

        if (preliminaryResult.error) {
            return { error: preliminaryResult.error };
        }

        // Perform final calculation with prepayments
        const finalParams = { loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments };
        const finalResult = calculateSchedule(finalParams);

        if (finalResult.error) {
            return { error: finalResult.error };
        }

        // Add savings info to the final result
        if (finalResult.data && preliminaryResult.data) {
            finalResult.data.interestSaved = prepayments.length > 0 ? preliminaryResult.data.totalInterest - finalResult.data.totalInterest : 0;
            finalResult.data.tenureReduced = prepayments.length > 0 ? preliminaryResult.data.monthlySchedule.length - finalResult.data.monthlySchedule.length : 0;
        }

        return finalResult;

    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, calculateSchedule, formErrors, appMode]);

    return {
        calculationResults: processedResult?.data,
        processedResult
    };
};

export default useLoanCalculator;