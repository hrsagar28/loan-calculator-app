import { formatCurrencyForPdf, formatNumberForPdf } from './formatters';

/**
 * Generates a PDF loan report.
 * @param {object} calculationResults - The results from the loan calculation.
 * @param {object} loanDetails - Basic details of the loan.
 * @param {object} pdfTheme - The color theme for the PDF.
 */
export const generatePdf = async (calculationResults, loanDetails, pdfTheme) => {
    const { loanAmount, interestRate, startDate, clientName, calculationMode } = loanDetails;

    // Dynamically load jsPDF libraries if they are not on the window object
    if (!window.jspdf) {
        throw new Error("jsPDF library not loaded.");
    }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let yPos = 0;

    // Helper to convert theme colors for PDF
    const convertColorForPdf = (color) => {
        if (typeof color !== 'string') return '#000000';
        if (color.startsWith('rgba')) {
            const parts = color.match(/(\d+)/g);
            if (parts && parts.length >= 3) {
                const r = parseInt(parts[0]).toString(16).padStart(2, '0');
                const g = parseInt(parts[1]).toString(16).padStart(2, '0');
                const b = parseInt(parts[2]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
            return '#000000'; // fallback
        }
        return color;
    };

    // --- PDF Header ---
    pdf.setFillColor(convertColorForPdf(pdfTheme.primary));
    pdf.rect(0, 0, pdfWidth, 20, 'F');

    const pdfTitle = clientName ? `Loan Report for M/s ${clientName}` : 'Loan Report';
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(convertColorForPdf(pdfTheme.onPrimary));
    pdf.text(pdfTitle, pdfWidth / 2, 12, { align: 'center' });
    yPos = 30;

    // --- Loan Summary Table ---
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(convertColorForPdf(pdfTheme.onSurface));
    pdf.text("Loan Summary", 10, yPos);
    yPos += 5;

    const summaryBody = [
        ['Loan Amount', formatCurrencyForPdf(parseFloat(String(loanAmount).replace(/,/g, '')))],
        ['Interest Rate', `${(calculationMode === 'rate' ? calculationResults.calculatedRate : parseFloat(interestRate)).toFixed(2)}%`],
        ['Loan Tenure', `${Math.floor(calculationResults.monthlySchedule.length / 12)} years ${calculationResults.monthlySchedule.length % 12} months`],
        ['Monthly EMI', formatCurrencyForPdf(calculationResults.calculatedEmi)],
        ['Total Interest Payable', formatCurrencyForPdf(calculationResults.totalInterest)],
        ['Total Payment (Principal + Interest)', formatCurrencyForPdf(calculationResults.totalPayment + calculationResults.totalInterest)],
        ['Loan Start Date', new Date(startDate).toLocaleDateString('en-IN')],
    ];

    pdf.autoTable({
        body: summaryBody,
        startY: yPos,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 2,
            textColor: convertColorForPdf(pdfTheme.onSurface),
            lineColor: convertColorForPdf(pdfTheme.outlineVariant),
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: convertColorForPdf(pdfTheme.surfaceContainer) },
        },
        margin: { left: 10, right: 10 },
    });

    yPos = pdf.autoTable.previous.finalY + 15;

    // --- Amortization Schedule Table ---
    if (calculationResults?.monthlySchedule) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(convertColorForPdf(pdfTheme.onSurface));
        pdf.text("Amortization Schedule (All amounts in INR)", 10, yPos);
        yPos += 8;

        const head = [['Month', 'Date', 'Principal', 'Interest', 'Prepayment', 'Balance']];
        const body = calculationResults.monthlySchedule.map(row => [
            row.month, row.date.toLocaleDateString('en-CA'),
            formatNumberForPdf(row.principal), formatNumberForPdf(row.interest),
            formatNumberForPdf(row.prepayment), formatNumberForPdf(row.endingBalance)
        ]);

        pdf.autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: {
                fillColor: convertColorForPdf(pdfTheme.primary),
                textColor: convertColorForPdf(pdfTheme.onPrimary),
                fontStyle: 'bold'
            },
            styles: {
                font: 'helvetica',
                fontSize: 8,
                cellPadding: 2,
                textColor: convertColorForPdf(pdfTheme.onSurface),
                lineColor: convertColorForPdf(pdfTheme.outlineVariant),
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: convertColorForPdf(pdfTheme.surfaceContainer)
            },
            margin: { top: 10, right: 10, bottom: 15, left: 10 },
            didDrawPage: function (data) {
                // --- PDF Footer ---
                pdf.setFontSize(8);
                pdf.setTextColor(convertColorForPdf(pdfTheme.onSurfaceVariant));
                const footerText = "Sagar H R & Co.,\nChartered Accountants";
                pdf.text(footerText, pdfWidth - data.settings.margin.right, pdfHeight - 10, { align: 'right' });
                pdf.text(`Page ${data.pageNumber}`, data.settings.margin.left, pdfHeight - 10);
            }
        });
    }

    // --- Save the PDF ---
    pdf.save(`Loan-Report-${clientName.replace(/ /g, '_') || 'General'}-${new Date().toISOString().split('T')[0]}.pdf`);
};
