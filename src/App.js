import React, { useState, useEffect, useCallback } from 'react';

// Hooks
import usePersistentState from './hooks/usePersistentState';
import useLoanCalculator from './hooks/useLoanCalculator';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ControlSidebar from './components/layout/ControlSidebar';
import DashboardView from './components/layout/DashboardView';
import RepaymentSchedule from './components/calculator/RepaymentSchedule';
import AffordabilityCalculator from './components/affordability/AffordabilityCalculator';
import Snackbar from './components/common/Snackbar';
import ConfirmationModal from './components/common/ConfirmationModal';
import SettingsModal from './components/common/SettingsModal';
import { PrepaymentModal } from './components/calculator/PrepaymentSimulator';


// Constants & Utils
import { themes } from './constants/themes';
import { icons } from './constants/icons';
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
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isPrepaymentModalOpen, setIsPrepaymentModalOpen] = useState(false);
    const [isAffordabilityModalOpen, setIsAffordabilityModalOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [pdfStatus, setPdfStatus] = useState('idle');
    const [areScriptsReady, setAreScriptsReady] = useState(false);
    
    // NEW: State to manage the main content view (dashboard or schedule)
    const [mainView, setMainView] = useState('dashboard'); // 'dashboard' or 'schedule'
    // NEW: State for mobile tab view
    const [mobileTab, setMobileTab] = useState('inputs'); // 'inputs' or 'results'


    // Custom Hook for Calculations
    const { calculationResults, processedResult, performCalculation } = useLoanCalculator({
        loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, appMode
    });
    
    useEffect(() => {
        if (appMode !== 'calculator' || !processedResult) {
            setMainView('dashboard');
            return;
        };
        setIsLoading(true);
        if (processedResult?.error) {
            setIsLoading(false);
            setMainView('dashboard');
        } else if (processedResult?.data) {
            const timer = setTimeout(() => {
                setIsLoading(false);
                setMobileTab('results'); // Switch to results on mobile after calculation
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
        }
    }, [processedResult, appMode]);

    // Debounced calculation
    useEffect(() => {
        const handler = setTimeout(() => {
            if (appMode === 'calculator') {
                performCalculation();
            }
        }, 500); // 500ms delay
        return () => clearTimeout(handler);
    }, [loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, appMode, performCalculation]);


    useEffect(() => {
        const lightTheme = themes[themeName]?.light;
        const darkTheme = themes[themeName]?.dark;
        if (!lightTheme || !darkTheme) return;

        const generateCssVars = (theme) => Object.entries(theme).map(([key, value]) => `--color-${key}: ${value};`).join('\n');

        const lightVars = generateCssVars(lightTheme);
        const darkVars = generateCssVars(darkTheme);

        let style = document.getElementById('dynamic-theme-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-theme-styles';
            document.head.appendChild(style);
        }

        style.innerHTML = `
            :root { ${lightVars} }
            .dark { ${darkVars} }
        `;
    }, [themeName]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

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

    const handleInteractiveClick = (callback) => (...args) => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (callback) callback(...args);
    };

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
        setMainView('dashboard');
        setMobileTab('inputs');
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

    const controlSidebarProps = {
      clientName, setClientName, loanAmount, handleInputChange, activeInput, formatInputValue,
      handleFocus, handleBlur, formErrors, calculationMode, setCalculationMode, tenureYears,
      setTenureYears, emi, interestRate, emiPaymentDay, startDate, setStartDate,
      onOpenPrepaymentModal: () => setIsPrepaymentModalOpen(true),
      onOpenAffordabilityModal: () => setIsAffordabilityModalOpen(true),
      prepayments,
      d,
      handleInteractiveClick
    };

    const KeyResultsPeek = () => {
        if (!calculationResults || isLoading || processedResult?.error) return null;
        return (
            <div className="mt-4 p-4 bg-surface-container rounded-2xl animate-cascade-in">
                <h3 className="text-lg font-bold text-on-surface-variant mb-2">Key Results</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-on-surface-variant">Calculated Rate</p>
                        <p className="font-bold text-primary text-lg">{calculationResults.calculatedRate.toFixed(2)}%</p>
                    </div>
                    <div>
                        <p className="text-on-surface-variant">EMI</p>
                        <p className="font-bold text-primary text-lg">{formatCurrency(calculationResults.calculatedEmi)}</p>
                    </div>
                    <div>
                        <p className="text-on-surface-variant">Total Interest</p>
                        <p className="font-bold text-tertiary text-lg">{formatCurrency(calculationResults.totalInterest)}</p>
                    </div>
                     <div>
                        <p className="text-on-surface-variant">Tenure</p>
                        <p className="font-bold text-on-surface text-lg">{`${Math.floor(calculationResults.monthlySchedule.length / 12)}y ${calculationResults.monthlySchedule.length % 12}m`}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 bg-background text-on-background ${fontSizes[fontSize]} flex flex-col overflow-x-hidden`}>
            <Header
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                setIsSettingsOpen={setIsSettingsOpen}
                handleReset={handleReset}
                handleInteractiveClick={handleInteractiveClick}
            />
            <main className="flex-grow flex flex-col lg:flex-row p-2 sm:p-4 lg:p-8 pt-0 gap-6">
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
                    handleInteractiveClick={handleInteractiveClick}
                />

                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={confirmReset}
                    title="Confirm Reset"
                    handleInteractiveClick={handleInteractiveClick}
                >
                    <p>Are you sure you want to reset all data? This will clear all your inputs, including prepayments. This action cannot be undone.</p>
                </ConfirmationModal>

                <PrepaymentModal 
                    isOpen={isPrepaymentModalOpen}
                    onClose={() => setIsPrepaymentModalOpen(false)}
                    prepayments={prepayments}
                    setPrepayments={setPrepayments}
                    formatCurrency={formatCurrency}
                    handleInteractiveClick={handleInteractiveClick}
                />

                <AffordabilityCalculator
                    isOpen={isAffordabilityModalOpen}
                    onClose={() => setIsAffordabilityModalOpen(false)}
                    setLoanAmount={setLoanAmount}
                    setEmi={setEmi}
                    setCalculationMode={setCalculationMode}
                    showNotification={showNotification}
                    density={d}
                    handleInteractiveClick={handleInteractiveClick}
                />


                <div className="lg:hidden w-full flex-shrink-0 p-1 bg-surface-container rounded-full border border-outline-variant">
                    <div className="flex relative">
                         <div
                            className="absolute top-0 bottom-0 bg-primary rounded-full shadow-md transition-all duration-500 ease-expressive"
                            style={{
                                left: mobileTab === 'inputs' ? '0%' : '50%',
                                width: '50%',
                            }}
                        />
                        <button onClick={() => setMobileTab('inputs')} className="relative w-1/2 py-2 font-semibold rounded-full z-10 transition-colors duration-300">
                            <span className={mobileTab === 'inputs' ? 'text-on-primary' : 'text-on-surface-variant'}>Inputs</span>
                        </button>
                        <button onClick={() => setMobileTab('results')} className="relative w-1/2 py-2 font-semibold rounded-full z-10 transition-colors duration-300">
                             <span className={mobileTab === 'results' ? 'text-on-primary' : 'text-on-surface-variant'}>Results</span>
                        </button>
                    </div>
                </div>

                <div className={`lg:w-1/3 lg:max-w-md flex-shrink-0 ${mobileTab === 'inputs' ? 'block' : 'hidden'} lg:block`}>
                    <ControlSidebar {...controlSidebarProps} />
                    <div className="lg:hidden">
                        <KeyResultsPeek />
                    </div>
                </div>
                
                <div className={`flex-grow min-w-0 ${mobileTab === 'results' ? 'block' : 'hidden'} lg:block`}>
                    {mainView === 'dashboard' ? (
                        <DashboardView
                            results={calculationResults}
                            isLoading={isLoading}
                            hasError={processedResult?.error}
                            errorMessage={processedResult?.error}
                            onShowSchedule={() => setMainView('schedule')}
                            formatCurrency={formatCurrency}
                            loanAmount={loanAmount}
                            interestRate={interestRate}
                            calculationMode={calculationMode}
                            density={d}
                        />
                    ) : (
                        <RepaymentSchedule
                            results={calculationResults}
                            onBack={() => setMainView('dashboard')}
                            formatCurrency={formatCurrency}
                            density={d}
                            handleExportCsv={handleExportCsv}
                            handleDownloadPdf={handleDownloadPdf}
                            pdfStatus={pdfStatus}
                            areScriptsReady={areScriptsReady}
                            handleInteractiveClick={handleInteractiveClick}
                        />
                    )}
                </div>
            </main>

            <Footer />

            <Snackbar message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: 'success' })} />
        </div>
    );
}