import { renderHook, act } from '@testing-library/react';
import useLoanCalculator from './useLoanCalculator';

describe('useLoanCalculator hook', () => {
    const defaultParams = {
        loanAmount: '1000000',
        tenureYears: '10',
        emi: '12133',
        interestRate: '8',
        startDate: '2025-01-01',
        emiPaymentDay: '5',
        prepayments: [],
        formErrors: {},
        appMode: 'calculator'
    };

    it('should calculate rate correctly', () => {
        const { result } = renderHook(() => useLoanCalculator({
            ...defaultParams,
            calculationMode: 'rate'
        }));
        
        act(() => {
            result.current.performCalculation();
        });

        expect(result.current.calculationResults.calculatedRate).toBeCloseTo(8.00, 2);
        expect(result.current.calculationResults.monthlySchedule.length).toBe(120);
    });

    it('should calculate EMI correctly', () => {
        const { result } = renderHook(() => useLoanCalculator({
            ...defaultParams,
            calculationMode: 'emi'
        }));

        act(() => {
            result.current.performCalculation();
        });

        expect(result.current.calculationResults.calculatedEmi).toBeCloseTo(12132.76, 2);
    });

    it('should calculate tenure correctly', () => {
        const { result } = renderHook(() => useLoanCalculator({
            ...defaultParams,
            calculationMode: 'tenure'
        }));

        act(() => {
            result.current.performCalculation();
        });

        expect(result.current.calculationResults.monthlySchedule.length).toBe(120);
    });
});