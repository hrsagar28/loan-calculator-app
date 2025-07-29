import React, { useState, useEffect, useMemo } from 'react';

// Hooks
import usePersistentState from './hooks/usePersistentState';
import useLoanCalculator from './hooks/useLoanCalculator';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Card from './components/common/Card';
import InputWithValidation from './components/common/InputWithValidation';
import ExpressiveSlider from './components/common/ExpressiveSlider';
import Snackbar from './components/common/Snackbar';
import ConfirmationModal from './components/common/ConfirmationModal';
import SettingsModal from './components/common/SettingsModal';
import LoanBreakdownChart from './components/charts/LoanBreakdownChart';
import BalanceDeclineChart from './components/charts/BalanceDeclineChart';
import CumulativeChart from './components/charts/CumulativeChart';
import ComprehensiveSummary from './components/calculator/ComprehensiveSummary';
import RepaymentSchedule from './components/calculator/RepaymentSchedule';
import { PrepaymentSimulator, PrepaymentSavings } from './components/calculator/PrepaymentSimulator';
import AffordabilityCalculator from './components/affordability/AffordabilityCalculator';


// Constants & Utils
import { themes } from './constants/themes';
import { formatInputValue, formatCurrency } from './utils/formatters';
import { generatePdf } from './utils/pdfGenerator';

export default function App() {
    // App-level state
    const [isDarkMode, setIsDarkMode] = usePersistentState('isDarkMode', false);
    const [themeName, setThemeName] = usePersistentState('themeName', 'Crystal Graphite');
    const [layoutDensity, setLayoutDensity] = usePersistentState('layoutDensity', 'comfortable');
    const [fontSize, setFontSize] = usePersistentState('fontSize', 'base');
    const [appMode, setAppMode] = usePersistentState('appMode', 'calculator');

    // Form Inputs & State
    const [loanAmount, setLoanAmount] = usePersistentState('loanAmount', '');
    const [tenureYears, setTenureYears] = usePersistentState('tenureYears', '15');
    const [emi, setEmi] = usePersistentState('emi', '');
    const [interestRate, setInterestRate] = usePersistentState('interestRate', '');
    const [startDate, setStartDate] = usePersistentState('startDate', new Date().toISOString().split('T')[0]);
    const [emiPaymentDay, setEmiPaymentDay] = usePersistentState('emiPaymentDay', '5');
    const [clientName, setClientName] = usePersistentState('clientName', '');
    const [prepayments, setPrepayments] = usePersistentState('loanPrepayments', []);

    // UI State
    const [formErrors, setFormErrors] = useState({});
    const [activeInput, setActiveInput] = useState(null);
    const [calculationMode, setCalculationMode] = useState('rate');
    const [showReport, setShowReport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [pdfStatus, setPdfStatus] = useState('idle');
    const [areScriptsReady, setAreScriptsReady] = useState(false);

    // Custom Hook for Calculations
    const { calculationResults, processedResult } = useLoanCalculator({
        loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, appMode
    });

    // Effect for dynamic theme styles
    useEffect(() => {
        const currentTheme = themes[themeName]?.[isDarkMode ? 'dark' : 'light'];
        if (!currentTheme) return;

        let style = document.getElementById('dynamic-theme-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-theme-styles';
            document.head.appendChild(style);
        }
        const cssVars = Object.entries(currentTheme).map(([key, value]) => `--color-${key}: ${value};`).join('\n');
        style.innerHTML = `:root { ${cssVars} --ease-expressive: cubic-bezier(0.4, 0.0, 0.2, 1); --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); }`;

        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode, themeName]);

    // Effect to show/hide report
    useEffect(() => {
        if (appMode !== 'calculator' || !processedResult) {
            setShowReport(false);
            return;
        };
        setIsLoading(true);
        if (processedResult?.error) {
            setIsLoading(false);
            setShowReport(false);
        } else if (processedResult?.data) {
            const timer = setTimeout(() => {
                setShowReport(true);
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
            setShowReport(false);
        }
    }, [processedResult, appMode]);

    // PDF Script Loading
     useEffect(() => {
        const loadScript = (src, id) => new Promise((resolve, reject) => {
            if (document.getElementById(id)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.id = id;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas-lib")
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf-lib"))
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js", "jspdf-autotable-lib"))
            .then(() => setAreScriptsReady(true))
            .catch(error => {
                console.error("Failed to load external scripts:", error);
                showNotification("Failed to load libraries for PDF generation.", "error");
            });
    }, []);


    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
    };

    const validateField = (name, value) => {
        const numValue = parseFloat(String(value).replace(/,/g, ''));
        switch (name) {
            case 'loanAmount': if (!value) return 'Loan amount is required.'; if (isNaN(numValue) || numValue <= 0) return 'Must be a positive number.'; if (numValue > 1000000000) return 'Amount seems too high.'; break;
            case 'emi':
                if (!value) return 'EMI is required.';
                if (isNaN(numValue) || numValue <= 0) return 'Must be a positive number.';
                if (loanAmount && numValue > parseFloat(String(loanAmount).replace(/,/g, ''))) return 'EMI cannot exceed loan amount.';
                break;
            case 'interestRate':
                if (!value) return 'Interest rate is required.';
                if (isNaN(numValue) || numValue < 0) return 'Cannot be negative.';
                if (numValue > 100) return 'Rate cannot exceed 100%.';
                break;
            case 'emiPaymentDay':
                if (!value) return 'Payment day is required.';
                if (isNaN(numValue) || numValue < 1 || numValue > 31) return 'Must be between 1 and 31.';
                break;
            default: break;
        }
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/,/g, '');

        const stateSetters = {
            loanAmount: setLoanAmount,
            emi: setEmi,
            interestRate: setInterestRate,
            emiPaymentDay: setEmiPaymentDay,
        };

        if (name === 'loanAmount' || name === 'emi') {
            if (!/^\d*\.?\d*$/.test(rawValue)) return;
            stateSetters[name](rawValue);
        } else if (name === 'interestRate' || name === 'emiPaymentDay') {
            if (!/^[0-9.]*$/.test(value)) return;
            stateSetters[name](value);
        }

        const error = validateField(name, rawValue);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFocus = (e) => setActiveInput(e.target.name);
    const handleBlur = (e) => {
        setActiveInput(null);
        const { name, value } = e.target;
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleReset = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        setLoanAmount('');
        setTenureYears('15');
        setEmi('');
        setInterestRate('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEmiPaymentDay('5');
        setClientName('');
        setPrepayments([]);
        setShowReport(false);
        setFormErrors({});
        setIsResetModalOpen(false);
        showNotification('All data has been reset.');
    };

    const handleDownloadPdf = async () => {
        if (!areScriptsReady) {
            showNotification("PDF library is loading. Please try again.", "error");
            return;
        }
        if (!calculationResults) {
            showNotification("Please calculate a loan schedule first.", "error");
            return;
        }
        setPdfStatus('generating');
        try {
            await generatePdf(calculationResults, { loanAmount, interestRate, startDate, clientName, calculationMode }, themes[themeName]['light']);
            showNotification('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            showNotification("Could not generate PDF. Please try again.", "error");
        } finally {
            setPdfStatus('idle');
        }
    };

    const handleExportCsv = () => {
        if (!calculationResults) return;
        const headers = ["Month", "Date", "Beginning Balance", "EMI", "Principal", "Interest", "Prepayment", "Ending Balance"];
        const rows = calculationResults.monthlySchedule.map(row =>
            [row.month, row.date.toLocaleDateString('en-CA'), row.beginningBalance.toFixed(2), row.emi.toFixed(2), row.principal.toFixed(2), row.interest.toFixed(2), row.prepayment.toFixed(2), row.endingBalance.toFixed(2)].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `amortization_schedule_${clientName.replace(/ /g, '_') || 'general'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('CSV export started!');
    };


    const densityClasses = {
        comfortable: { gap: 'gap-8', p: 'p-6', summaryGap: 'gap-4', summaryP: 'p-3', tableP: 'p-4', tableCell: 'py-4 px-6' },
        compact: { gap: 'gap-4', p: 'p-4', summaryGap: 'gap-3', summaryP: 'p-2.5', tableP: 'p-2', tableCell: 'py-3 px-4' }
    };
    const d = densityClasses[layoutDensity];
    const fontSizes = { base: 'text-base', sm: 'text-sm', lg: 'text-lg' };

    return (
        <div className={`min-h-screen transition-colors duration-300 bg-background text-on-background ${fontSizes[fontSize]} flex flex-col`}>
            <Header
                clientName={clientName}
                setClientName={setClientName}
                appMode={appMode}
                setAppMode={setAppMode}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                setIsSettingsOpen={setIsSettingsOpen}
                handleReset={handleReset}
                handleExportCsv={handleExportCsv}
                handleDownloadPdf={handleDownloadPdf}
                pdfStatus={pdfStatus}
                areScriptsReady={areScriptsReady}
                hasResults={!!calculationResults && !processedResult.error}
            />

            <main className="p-2 sm:p-4 lg:p-8 pt-0 view-container flex-grow flex flex-col">
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    themes={themes}
                    themeName={themeName}
                    setThemeName={setThemeName}
                    layoutDensity={layoutDensity}
                    setLayoutDensity={setLayoutDensity}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                />

                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={confirmReset}
                    title="Confirm Reset"
                >
                    <p>Are you sure you want to reset all data? This will clear all your inputs, including prepayments. This action cannot be undone.</p>
                </ConfirmationModal>

                {appMode === 'calculator' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            <div className="lg:col-span-2">
                                <Card className={`${d.p} h-full flex flex-col`}>
                                   {/* Calculation Mode Switch and Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 flex-grow pt-6">
                                        <div className="flex flex-col h-full">
                                            <div className="space-y-4">
                                                <InputWithValidation id="loanAmount" name="loanAmount" label="Loan Amount" value={activeInput === 'loanAmount' ? loanAmount : formatInputValue(loanAmount)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.loanAmount} unit="₹" type="text" maxLength="12" inputMode="decimal" />
                                                {calculationMode !== 'tenure' && <ExpressiveSlider min={1} max={30} step={1} value={Number(tenureYears)} onChange={(v) => setTenureYears(String(v))} icon="Calendar" />}
                                                {calculationMode !== 'emi' && <InputWithValidation id="emi" name="emi" label="Monthly EMI" value={activeInput === 'emi' ? emi : formatInputValue(emi)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.emi} unit="₹" type="text" maxLength="9" inputMode="decimal" />}
                                                {calculationMode !== 'rate' && <InputWithValidation id="interestRate" name="interestRate" label="Interest Rate (%)" value={interestRate} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.interestRate} icon="Percent" type="text" maxLength="5" inputMode="decimal" />}
                                            </div>
                                             {calculationResults && !processedResult.error && (
                                                <div className="mt-auto">
                                                    <ComprehensiveSummary results={calculationResults} formatCurrency={formatCurrency} interestRate={interestRate} calculationMode={calculationMode} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4 flex flex-col">
                                            <div>
                                                <InputWithValidation id="emiPaymentDay" name="emiPaymentDay" label="EMI Payment Day" value={emiPaymentDay} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.emiPaymentDay} icon="Calendar" type="text" maxLength="2" inputMode="numeric" helpText="Day from 1-31. Adjusted for shorter months." />
                                                <div><label htmlFor="startDate" className="block font-medium mb-1.5 text-on-surface-variant">Loan Start Date</label><div className="relative input-field rounded-xl"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><i className="fas fa-calendar"></i></div><input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none rounded-xl" /></div></div>
                                            </div>
                                            <PrepaymentSimulator prepayments={prepayments} setPrepayments={setPrepayments} formatCurrency={formatCurrency} />
                                            <PrepaymentSavings results={calculationResults} formatCurrency={formatCurrency} />
                                            {processedResult && processedResult.error && <div className="mt-6 p-4 rounded-2xl bg-error-container text-on-error-container"><p className="font-bold">Error</p><p>{processedResult.error}</p></div>}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            {calculationResults && !processedResult.error && (
                                <div className="lg:col-span-1">
                                    <Card className="p-4 h-full flex flex-col justify-around">
                                        <LoanBreakdownChart principal={parseFloat(String(loanAmount).replace(/,/g, ''))} interest={calculationResults.totalInterest} isVisible={showReport} />
                                        <div className="border-b border-outline-variant my-2"></div>
                                        <BalanceDeclineChart schedule={calculationResults.monthlySchedule} isVisible={showReport} formatCurrency={formatCurrency} maxChartValue={parseFloat(String(loanAmount).replace(/,/g, ''))} />
                                        <div className="border-b border-outline-variant my-2"></div>
                                        <CumulativeChart schedule={calculationResults.monthlySchedule} isVisible={showReport} formatCurrency={formatCurrency} maxChartValue={calculationResults.totalPayment} />
                                    </Card>
                                </div>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="animate-pulse space-y-8"><div className="h-52 rounded-2xl bg-surface-container-highest"></div><div className="h-96 rounded-2xl bg-surface-container-highest"></div></div>
                        ) : calculationResults && !processedResult.error ? (
                            <RepaymentSchedule
                                results={calculationResults}
                                isOpen={isScheduleOpen}
                                setIsOpen={setIsScheduleOpen}
                                formatCurrency={formatCurrency}
                                density={d}
                                isVisible={showReport}
                            />
                        ) : null}
                    </div>
                ) : (
                   <AffordabilityCalculator
                        setLoanAmount={setLoanAmount}
                        setEmi={setEmi}
                        setAppMode={setAppMode}
                        setCalculationMode={setCalculationMode}
                        showNotification={showNotification}
                        density={d}
                    />
                )}
            </main>

            <Footer />

            <Snackbar message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: 'success' })} />
        </div>
    );
}
