import React from 'react';

/**
 * Formats a numeric string for display by adding commas for thousands.
 * @param {string | number} val - The value to format.
 * @returns {string} The formatted number string.
 */
export const formatInputValue = (val) => {
    if (!val) return '';
    // Remove existing commas and convert to number
    const num = parseFloat(String(val).replace(/,/g, ''));
    // Return formatted string or empty if not a number
    return isNaN(num) ? '' : num.toLocaleString('en-IN');
};

/**
 * Formats a number as Indian Rupee currency.
 * @param {number} v - The number to format.
 * @returns {string} The formatted currency string (e.g., "₹1,00,000").
 */
export const formatCurrency = (v) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(v || 0);
};

/**
 * Formats a number as Indian Rupee currency for PDF documents.
 * @param {number} v - The number to format.
 * @returns {string} The formatted currency string with two decimal places (e.g., "INR 1,00,000.00").
 */
export const formatCurrencyForPdf = (v) => {
    return `INR ${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formats a number for PDF documents, including commas.
 * @param {number} v - The number to format.
 * @returns {string} The formatted number string.
 */
export const formatNumberForPdf = (v) => {
    return (v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
