import { formatInputValue, formatCurrency, formatCurrencyForPdf, formatNumberForPdf } from './formatters';

describe('formatter utilities', () => {
    describe('formatInputValue', () => {
        it('should format numbers with Indian commas', () => {
            expect(formatInputValue(100000)).toBe('1,00,000');
            expect(formatInputValue('1234567')).toBe('12,34,567');
        });

        it('should return an empty string for null or undefined', () => {
            expect(formatInputValue(null)).toBe('');
            expect(formatInputValue(undefined)).toBe('');
        });

        it('should handle non-numeric strings gracefully', () => {
            expect(formatInputValue('abc')).toBe('');
        });
    });

    describe('formatCurrency', () => {
        it('should format numbers as Indian Rupee currency', () => {
            expect(formatCurrency(50000)).toBe('₹50,000');
            expect(formatCurrency(1234567.89)).toBe('₹12,34,568'); // Note the rounding
        });

        it('should handle zero and undefined values', () => {
            expect(formatCurrency(0)).toBe('₹0');
            expect(formatCurrency(undefined)).toBe('₹0');
        });
    });

    describe('formatCurrencyForPdf', () => {
        it('should format numbers for PDF with two decimal places', () => {
            expect(formatCurrencyForPdf(100000)).toBe('INR 1,00,000.00');
            expect(formatCurrencyForPdf(54321.2)).toBe('INR 54,321.20');
        });
    });

    describe('formatNumberForPdf', () => {
        it('should format numbers for PDF with commas and no decimals', () => {
            expect(formatNumberForPdf(1234567.89)).toBe('12,34,568');
        });
    });
});